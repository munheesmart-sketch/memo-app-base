import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const MAX_CONTENT_LENGTH = 8000

function buildPrompt(title: string, content: string): string {
  return `다음 메모를 한국어로 요약해줘. 핵심 내용을 3~5줄로 간결하게 정리하고, 할 일이나 중요 포인트가 있다면 별도로 짧게 언급해.

제목: ${title}

내용:
${content}

요약:`
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env.local에 키를 추가해주세요.',
      },
      { status: 500 }
    )
  }

  let body: { title?: string; content?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: '요청 본문을 파싱할 수 없습니다.' },
      { status: 400 }
    )
  }

  const title = (body.title ?? '').trim()
  const content = (body.content ?? '').trim()

  if (!content) {
    return NextResponse.json(
      { error: '요약할 메모 내용이 없습니다.' },
      { status: 400 }
    )
  }

  const truncatedContent =
    content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH) + '\n...(이하 생략)'
      : content

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildPrompt(title, truncatedContent),
      config: {
        temperature: 0.4,
        maxOutputTokens: 512,
      },
    })

    const summary = response.text
    if (!summary) {
      return NextResponse.json(
        { error: 'Gemini 응답이 비어 있습니다. 잠시 후 다시 시도해주세요.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('[summarize] Gemini API error:', error)
    return NextResponse.json(
      { error: '요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 502 }
    )
  }
}

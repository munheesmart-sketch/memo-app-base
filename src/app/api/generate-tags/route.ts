import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const MAX_CONTENT_LENGTH = 8000
const MAX_TAGS = 12

function buildPrompt(title: string, content: string): string {
  return `다음 메모의 제목과 내용을 읽고, 나중에 검색·분류할 때 쓰기 좋은 짧은 한국어 태그를 3~8개 제안해줘.

규칙:
- 각 태그는 한 단어 또는 짧은 구(2~12자 권장)
- # 기호·따옴표·쉼표를 태그 안에 넣지 말 것
- 응답은 JSON 배열만 출력하고, 설명·마크다운·코드펜스는 쓰지 말 것

올바른 응답 예: ["회의","마감","기획"]

제목: ${title}

내용:
${content}`
}

function parseTagArray(text: string): string[] {
  const trimmed = text.trim()
  const bracket = trimmed.match(/\[[\s\S]*\]/)
  if (!bracket) return []
  try {
    const parsed: unknown = JSON.parse(bracket[0])
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is string => typeof item === 'string')
      .map(s => s.replace(/^#+\s*/, '').trim())
      .filter(s => s.length > 0 && s.length <= 32)
  } catch {
    return []
  }
}

function uniqueTags(tags: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of tags) {
    const key = t.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
    if (out.length >= MAX_TAGS) break
  }
  return out
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

  if (!title && !content) {
    return NextResponse.json(
      { error: '태그를 만들려면 제목 또는 내용을 입력해주세요.' },
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
        temperature: 0.5,
        maxOutputTokens: 256,
      },
    })

    const raw = response.text
    if (!raw) {
      return NextResponse.json(
        { error: 'Gemini 응답이 비어 있습니다. 잠시 후 다시 시도해주세요.' },
        { status: 502 }
      )
    }

    const tags = uniqueTags(parseTagArray(raw))
    if (tags.length === 0) {
      return NextResponse.json(
        { error: '태그를 해석하지 못했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('[tags/generate] Gemini API error:', error)
    return NextResponse.json(
      { error: '태그 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 502 }
    )
  }
}

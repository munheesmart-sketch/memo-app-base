'use client'

import { useCallback, useEffect, useState } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MarkdownViewer from './MarkdownViewer'

interface MemoDetailModalProps {
  memo: Memo | null
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoDetailModal({
  memo,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailModalProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)

  useEffect(() => {
    setSummary(null)
    setSummaryError(null)
    setIsSummarizing(false)
  }, [memo?.id])

  const handleSummarize = useCallback(async () => {
    if (!memo || isSummarizing) return
    setSummary(null)
    setSummaryError(null)
    setIsSummarizing(true)
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: memo.title, content: memo.content }),
      })
      const data = (await response.json()) as { summary?: string; error?: string }
      if (!response.ok || data.error) {
        setSummaryError(data.error ?? '요약 중 오류가 발생했습니다.')
      } else {
        setSummary(data.summary ?? '')
      }
    } catch {
      setSummaryError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSummarizing(false)
    }
  }, [memo, isSummarizing])

  useEffect(() => {
    if (!memo) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [memo, onClose])

  if (!memo) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal:
        'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200',
      work:
        'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-200',
      study:
        'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200',
      idea:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-stone-700 dark:text-stone-200',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-black/70"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-detail-title"
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-stone-800 dark:border dark:border-stone-600 dark:shadow-stone-950/50"
        onClick={event => event.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div className="min-w-0">
              <h2
                id="memo-detail-title"
                className="text-2xl font-semibold text-gray-900 mb-3 break-words dark:text-stone-100"
              >
                {memo.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
                >
                  {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                    memo.category}
                </span>
                <span className="text-gray-500 dark:text-stone-400">
                  수정: {formatDate(memo.updatedAt)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-stone-500 dark:hover:text-stone-200 dark:hover:bg-stone-700"
              aria-label="메모 상세 닫기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <MarkdownViewer content={memo.content} />
            </div>

            {/* AI 요약 영역 */}
            {(summary || summaryError) && (
              <div
                className={`rounded-lg border p-4 text-sm ${
                  summaryError
                    ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30'
                    : 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2 font-medium text-xs text-gray-500 dark:text-stone-400 uppercase tracking-wide">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  AI 요약
                </div>
                {summaryError ? (
                  <p className="text-red-700 dark:text-red-400">{summaryError}</p>
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap dark:text-stone-300">
                    {summary}
                  </p>
                )}
              </div>
            )}

            {memo.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {memo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md dark:bg-stone-700 dark:text-stone-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-sm text-gray-500 space-y-1 border-t border-gray-200 pt-4 dark:text-stone-400 dark:border-stone-600">
              <p>작성: {formatDate(memo.createdAt)}</p>
              <p>수정: {formatDate(memo.updatedAt)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/40 dark:hover:bg-blue-950/60"
            >
              {isSummarizing ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  요약 중...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  AI 요약하기
                </>
              )}
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onEdit(memo)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                편집
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

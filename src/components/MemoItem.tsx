'use client'

import type { KeyboardEvent, MouseEvent } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'

interface MemoItemProps {
  memo: Memo
  onView: (memo: Memo) => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoItem({
  memo,
  onView,
  onEdit,
  onDelete,
}: MemoItemProps) {
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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onView(memo)
    }
  }

  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onEdit(memo)
  }

  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(memo)}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-stone-800/95 dark:border-stone-600 dark:shadow-stone-950/40 dark:focus:ring-offset-stone-900"
    >
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 dark:text-stone-100">
            {memo.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
            >
              {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                memo.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-stone-400">
              {formatDate(memo.updatedAt)}
            </span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleEditClick}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-stone-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/40"
            title="편집"
            aria-label={`${memo.title} 편집`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-stone-400 dark:hover:text-red-400 dark:hover:bg-red-950/40"
            title="삭제"
            aria-label={`${memo.title} 삭제`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 내용 */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 dark:text-stone-300">
          {memo.content}
        </p>
      </div>

      {/* 태그 */}
      {memo.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {memo.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md dark:bg-stone-700 dark:text-stone-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

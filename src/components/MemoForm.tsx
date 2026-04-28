'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Memo,
  MemoFormData,
  MEMO_CATEGORIES,
  DEFAULT_CATEGORIES,
} from '@/types/memo'
import MarkdownViewer from './MarkdownViewer'

interface MemoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MemoFormData) => void
  editingMemo?: Memo | null
}

export default function MemoForm({
  isOpen,
  onClose,
  onSubmit,
  editingMemo,
}: MemoFormProps) {
  const [formData, setFormData] = useState<MemoFormData>({
    title: '',
    content: '',
    category: 'personal',
    tags: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [tagGenerating, setTagGenerating] = useState(false)
  const [contentMode, setContentMode] = useState<'write' | 'preview'>('write')

  // 편집 모드일 때 폼 데이터 설정
  useEffect(() => {
    if (editingMemo) {
      setFormData({
        title: editingMemo.title,
        content: editingMemo.content,
        category: editingMemo.category,
        tags: editingMemo.tags,
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'personal',
        tags: [],
      })
    }
    setTagInput('')
    setContentMode('write')
  }, [editingMemo, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }
    onSubmit(formData)
    onClose()
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleAutoGenerateTags = useCallback(async () => {
    const title = formData.title.trim()
    const content = formData.content.trim()
    if (!title && !content) {
      alert('태그 자동 생성을 위해 제목 또는 내용을 입력해주세요.')
      return
    }
    setTagGenerating(true)
    try {
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data: { tags?: string[]; error?: string } = await response.json()
      if (!response.ok) {
        alert(data.error ?? '태그 생성에 실패했습니다.')
        return
      }
      const generated = data.tags ?? []
      if (generated.length === 0) {
        alert('생성된 태그가 없습니다.')
        return
      }
      setFormData(prev => {
        const merged = [...prev.tags]
        const lower = new Set(merged.map(t => t.toLowerCase()))
        for (const t of generated) {
          const key = t.toLowerCase()
          if (!lower.has(key)) {
            lower.add(key)
            merged.push(t)
          }
        }
        return { ...prev, tags: merged }
      })
    } catch {
      alert('태그 생성 중 오류가 발생했습니다.')
    } finally {
      setTagGenerating(false)
    }
  }, [formData.title, formData.content])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-black/70">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-stone-800 dark:border dark:border-stone-600 dark:shadow-stone-950/50">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-stone-100">
              {editingMemo ? '메모 편집' : '새 메모 작성'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-stone-500 dark:hover:text-stone-200 dark:hover:bg-stone-700"
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

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2 dark:text-stone-300"
              >
                제목 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="placeholder-gray-400 text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
                placeholder="메모 제목을 입력하세요"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2 dark:text-stone-300"
              >
                카테고리
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100"
              >
                {DEFAULT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {MEMO_CATEGORIES[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* 내용 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 dark:text-stone-300"
                >
                  내용 *
                </label>
                <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1 dark:border-stone-600 dark:bg-stone-900/80">
                  <button
                    type="button"
                    onClick={() => setContentMode('write')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      contentMode === 'write'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-stone-800 dark:text-stone-100 dark:shadow-stone-950/40'
                        : 'text-gray-500 hover:text-gray-700 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    작성
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentMode('preview')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      contentMode === 'preview'
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-stone-800 dark:text-stone-100 dark:shadow-stone-950/40'
                        : 'text-gray-500 hover:text-gray-700 dark:text-stone-400 dark:hover:text-stone-200'
                    }`}
                  >
                    미리보기
                  </button>
                </div>
              </div>

              {contentMode === 'write' ? (
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  className="placeholder-gray-400 text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
                  placeholder="메모 내용을 입력하세요"
                  rows={8}
                  required
                />
              ) : (
                <div className="min-h-[208px] w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:border-stone-600 dark:bg-stone-900/40">
                  <MarkdownViewer content={formData.content} />
                </div>
              )}
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-stone-300">
                태그
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="placeholder-gray-400 text-gray-900 min-w-[140px] flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:border-stone-600 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500"
                  placeholder="태그를 입력하고 Enter를 누르세요"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={handleAutoGenerateTags}
                  disabled={tagGenerating}
                  className="px-4 py-2 bg-violet-100 text-violet-900 hover:bg-violet-200 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none dark:bg-violet-950/60 dark:text-violet-200 dark:hover:bg-violet-900/50"
                >
                  {tagGenerating ? '생성 중…' : '태그 자동 생성'}
                </button>
              </div>

              {/* 태그 목록 */}
              {formData.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-950/60 dark:text-blue-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <svg
                          className="w-3 h-3"
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
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                {editingMemo ? '수정하기' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

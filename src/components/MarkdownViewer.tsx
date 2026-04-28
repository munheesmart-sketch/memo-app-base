'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownViewerProps {
  content: string
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content.trim()) {
    return (
      <div className="text-sm text-gray-500 dark:text-stone-500">
        미리볼 내용이 없습니다.
      </div>
    )
  }

  return (
    <div className="max-w-none text-gray-700 break-words dark:text-stone-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 first:mt-0 dark:text-stone-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-3 first:mt-0 dark:text-stone-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2 first:mt-0 dark:text-stone-100">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed my-3 first:mt-0 last:mb-0">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ children, className }) => {
            const isBlockCode = className?.startsWith('language-')

            if (isBlockCode) {
              return (
                <code className="block bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto text-sm dark:bg-stone-950 dark:text-stone-100">
                  {children}
                </code>
              )
            }

            return (
              <code className="bg-gray-100 text-red-700 rounded px-1 py-0.5 text-sm dark:bg-stone-700 dark:text-amber-200">
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="my-4">{children}</pre>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-300 text-sm dark:border-stone-600">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-900 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-3 py-2 dark:border-stone-600">
              {children}
            </td>
          ),
          input: props => (
            <input
              {...props}
              className="mr-2 align-middle"
              disabled
              readOnly
            />
          ),
          hr: () => (
            <hr className="my-6 border-gray-200 dark:border-stone-600" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

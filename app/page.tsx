'use client'

import { useRef, useState, Fragment } from 'react'

const hashtagRegex =
  /(^|\s)#(?=.*[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF])[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uF900-\uFAFF]+(?=\s|$)/g
const handleRegex = /(^|\s)@[a-zA-Z0-9]+(?=\s|$)/g
const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g

export default function Home() {
  const [text, setText] = useState('')
  const [count, setCount] = useState(0)

  const contentRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleCopy = () => {
    if (contentRef.current) {
      const content = contentRef.current.innerText
      navigator.clipboard.writeText(content)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = event.target.value
    const urlMatches: string[] = inputValue.match(urlRegex) || []
    const urlLength = urlMatches.reduce((acc, match) => acc + 22, 0)
    const nonUrlText = inputValue.replace(urlRegex, '')
    const nonUrlLength = Array.from(nonUrlText).reduce(
      (acc, char) => acc + (char.charCodeAt(0) > 255 ? 2 : 1),
      0
    )
    setText(inputValue)
    setCount(urlLength + nonUrlLength)
    adjustTextAreaHeight()
  }

  const MAX_HEIGHT = 755 // Maximum height in pixels

  const adjustTextAreaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`

      if (textAreaRef.current.scrollHeight > MAX_HEIGHT) {
        textAreaRef.current.style.height = `${MAX_HEIGHT}px`
        textAreaRef.current.style.overflowY = 'auto'
      }
    }
  }

  const renderText = (text: string) => {
    const matches: { startIndex: number; endIndex: number; regex: RegExp }[] =
      []

    let match

    while ((match = hashtagRegex.exec(text)) !== null) {
      matches.push({
        startIndex: match.index,
        endIndex: hashtagRegex.lastIndex,
        regex: hashtagRegex,
      })
    }
    while ((match = handleRegex.exec(text)) !== null) {
      matches.push({
        startIndex: match.index,
        endIndex: handleRegex.lastIndex,
        regex: handleRegex,
      })
    }
    while ((match = urlRegex.exec(text)) !== null) {
      matches.push({
        startIndex: match.index,
        endIndex: urlRegex.lastIndex,
        regex: urlRegex,
      })
    }

    matches.sort((a, b) => a.startIndex - b.startIndex)

    const result: JSX.Element[] = []

    let lastIndex = 0

    for (const match of matches) {
      const { startIndex, endIndex, regex } = match

      const beforeSegment = text.slice(lastIndex, startIndex)
      const matchSegment = text.slice(startIndex, endIndex)

      result.push(<span key={`before-${startIndex}`}>{beforeSegment}</span>)
      result.push(
        <span key={`match-${startIndex}`} className="text-blue-500">
          {matchSegment}
        </span>
      )
      lastIndex = endIndex
    }

    if (lastIndex < text.length) {
      const remainingSegment = text.slice(lastIndex)
      result.push(
        <span key={`remaining-${lastIndex}`}>{remainingSegment}</span>
      )
    }

    return (
      <div className="whitespace-pre-wrap pb-2">
        {result.map((element, index) => (
          <Fragment key={index}>
            {element}
            {index < result.length - 1 && ''}
          </Fragment>
        ))}
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4">
      <div className="py-8">
        <h1 className="mb-4 text-center text-3xl font-bold">Tweet Editor</h1>
        <div className="mb-1 flex items-center justify-between space-x-2">
          <div className="px-2">
            <span className={count > 280 ? 'text-red-500' : ''}>{count}</span>
          </div>
          <button
            onClick={handleCopy}
            className="rounded border border-gray-800 px-2 text-sm hover:border-gray-700"
          >
            Copy
          </button>
        </div>
        <div className="space-y-2 sm:flex sm:space-x-2 sm:space-y-0">
          <div className="h-full w-full rounded bg-gray-800 px-4 pt-2">
            <textarea
              rows={5}
              ref={textAreaRef}
              value={text}
              onChange={handleChange}
              className="w-full resize-none bg-gray-800 focus:outline-none"
            />
          </div>
          <div
            ref={contentRef}
            className="max-h-192 w-full overflow-y-auto rounded bg-gray-900 px-4 pt-2"
          >
            {renderText(text)}
          </div>
        </div>
      </div>
    </main>
  )
}

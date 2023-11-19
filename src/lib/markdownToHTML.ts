import {unified} from "unified"
import remarkParse from 'remark-parse'

export default async function markdownToHtml(markdown: string) {
  const result = await unified().use(remarkParse).parse(markdown)
  return result.toString()
}

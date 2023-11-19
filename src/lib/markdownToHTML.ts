import {unified} from "unified"
import remarkRehype from 'remark-rehype'

export default async function markdownToHtml(markdown: string) {
  const result = await unified().use(remarkRehype).process(markdown)
  return result.toString()
}

export default function formatCategoryString(string:string):string{
    if(string === undefined) return ''
    if(string.includes('Theme')) return 'theme'
    if(string.includes('SSR')) return 'ssr'
    if(string.includes('Integration')) return 'integration'
}
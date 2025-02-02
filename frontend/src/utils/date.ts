/**
 * 格式化日期
 * @param date 日期字符串或时间戳
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | number): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * 获取相对时间
 * @param date 日期字符串或时间戳
 * @returns 相对时间字符串
 */
export const getRelativeTime = (date: string | number): string => {
  const now = new Date().getTime()
  const target = new Date(date).getTime()
  const diff = now - target

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}分钟前`
  }

  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }

  // 小于1周
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }

  // 其他情况返回完整日期
  return formatDate(date)
} 
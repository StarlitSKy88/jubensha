/**
 * 验证邮箱格式
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证密码强度
 */
export const validatePassword = (password: string): boolean => {
  // 密码至少6个字符
  if (password.length < 6) {
    return false
  }

  return true
}

/**
 * 验证用户名格式
 */
export const validateUsername = (username: string): boolean => {
  // 用户名长度3-50个字符
  if (username.length < 3 || username.length > 50) {
    return false
  }

  // 只允许字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  return usernameRegex.test(username)
}

/**
 * 验证手机号格式
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证URL格式
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证日期格式
 */
export const validateDate = (date: string): boolean => {
  const timestamp = Date.parse(date)
  return !isNaN(timestamp)
}

/**
 * 验证是否为正整数
 */
export const validatePositiveInteger = (num: number): boolean => {
  return Number.isInteger(num) && num > 0
}

/**
 * 验证是否为合法的ID
 */
export const validateId = (id: string): boolean => {
  // ID长度至少1个字符
  if (id.length < 1) {
    return false
  }

  // 只允许字母、数字、下划线、中划线
  const idRegex = /^[a-zA-Z0-9_-]+$/
  return idRegex.test(id)
} 
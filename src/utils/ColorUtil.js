/**
 * 标签转颜色工具类
 * 支持多标签自定义颜色映射，将自定义标签替换为带颜色样式的span标签
 */
export const TagToColorUtil = {
  // 默认标签-颜色映射（可覆盖/扩展）
  defaultTagColorMap: {
    green: '#73b185', // 绿
    blue: '#6b92b3', // 蓝
    purple: '#a28fd0', // 紫
    orange: '#ffb84d', // 橘
    red: '#e64c65', // 红
    num: '#808080', // 数字
    flower: '#52c41a', // 鲜花
    vase: '#bba474', // 花瓶
    coin: '#F5D76E', // 金币
    exp: '#9370DB', // 经验
    diamond: '#88b8ff', // 钻石
    success: '#36b37e', // 成功
    fail: '#ff5630', // 失败
    customerCoin: '#b794f4', // 花市券/好评券
    material: '#d9b38c', // 材料/培育材料
  },

  /**
   * 核心方法：替换字符串中的自定义标签为带颜色的span
   * @param {string} str - 原始字符串（含自定义标签）
   * @param {object} customTagColorMap - 自定义标签颜色映射（覆盖默认配置）
   * @returns {string} 替换后的HTML字符串
   */
  convert(str, customTagColorMap = {}) {
    // 入参校验：非字符串直接返回
    if (typeof str !== 'string') {
      return str || ''
    }

    // 合并默认配置和自定义配置（自定义优先级更高）
    const tagColorMap = { ...this.defaultTagColorMap, ...customTagColorMap }

    // 遍历所有标签配置，逐个替换
    Object.entries(tagColorMap).forEach(([tag, color]) => {
      // 构建正则：匹配<tag>内容</tag>，支持标签内空格/换行
      const reg = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'g')
      // 替换为带样式的span
      str = str.replace(reg, (_, content) => {
        const cleanContent = content.trim() // 去除首尾空格
        return `<span style="color: ${color};">${cleanContent}</span>`
      })
    })

    return str
  },

  /**
   * 便捷方法：仅替换指定标签（避免全量替换）
   * @param {string} str - 原始字符串
   * @param {string} tag - 要替换的标签名（如'num'）
   * @param {string} color - 目标颜色
   * @returns {string} 替换后的字符串
   */
  convertSingleTag(str, tag, color) {
    return this.convert(str, { [tag]: color })
  },
}

// 导出默认实例（方便直接调用）
export default TagToColorUtil

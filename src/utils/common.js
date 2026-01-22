const timestampToFormattedDate = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear(); // 获取年份
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份，+1 因为 getMonth() 返回 0-11
  const day = String(date.getDate()).padStart(2, '0'); // 获取日期

  return `${year}-${month}-${day}`; // 格式化为 yyyy-MM-dd
}

export default timestampToFormattedDate;
import request from '/src/util/request'

// 获取好友关系列表
export const friendListService = (params) => {
  return request.get('/friend/list', { params })
}

export const friendAddService = (friendForm) => {
  return request.post('/friend/add', friendForm)
}

// 删除好友关系
export const friendDeleteService = (id) => {
  return request.delete(`/friend/${id}`)
}




import request from '@/util/request'

// 获取私聊房间列表
export const privateRoomListService = (params) => {
  return request.get('/room/listPrivate', { params })
}

// 创建私聊房间
export const privateRoomAddService = (data) => {
  return request.post('/room/addPrivate', data)
}

// 修改私聊房间状态
export const convertStatusService = (params) => {
  return request.post('/room/convertStatus', {
    roomId: params.roomId,
    status: params.status
  })
}

// 删除私聊房间
export const privateRoomDeleteService = (id) => {
  return request.delete(`/room/deletePrivate/${id}`)
}

// 批量删除私聊房间
export const privateRoomBatchDeleteService = (ids) => {
  return request.post('/room/delBatchOnPrivate', ids)
} 
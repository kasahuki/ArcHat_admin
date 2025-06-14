import request from '/src/util/request'

export const userRegisterService = (userRegisterForm)=>{
  return request.post('/user/register',userRegisterForm)
}

export const userLoginService = (userLoginForm)=>{
  return request.post('/user/login',userLoginForm)
}

export const userListService = (params) => {
  return request.get('/user/list', { params })
}

export const userListAlluserService  = ()=>{
  return request.get('/user/all')
}

export const userDeleteService = (id)=>{
  return request.delete(`/user/${id}`)
}

export const userModifyService = (userInfoForm)=>{
  return request.put('/user',userInfoForm)
}

export const userDeleteBatchService = (userIds) => {
  return request.post('/user/deleteBatch', userIds)
}

export const logoutService = (token)=>{
  return request.post("/user/logout",{token})
}




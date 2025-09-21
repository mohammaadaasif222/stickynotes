import {adminApiClient, userApiClient} from './client'

const withdrawalAPI = {
  createWithdrawal: (data) => 
    userApiClient.post(`/withdrawals/request`, data),
  
  getUserWithdrawals: (params) => 
    userApiClient.get(`/withdrawals/my-withdrawals`, { params }),
  
  getAllWithdrawals: (params) => 
    adminApiClient.get(`/withdrawals/all`, { params }),
  
  updateWithdrawal: (id, data) => 
    adminApiClient.put(`/withdrawals/${id}`, data),
  
  getStats: (params) => 
    adminApiClient.get(`/withdrawals/stats/overview`, { params }),
  
  getWithdrawal: (id) => 
    userApiClient.get(`/withdrawals/${id}`)
};

export { withdrawalAPI };
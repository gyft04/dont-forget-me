import axios from 'axios'
import { API_PATH } from '../commons/config.js'

// Gemeinsame Axios-Instanz für alle REST-Anfragen des Frontends.
export const axiosAgent = axios.create({ baseURL: API_PATH })

// Netzwerk- und Serverfehler werden in ein einheitliches Antwortformat überführt.
function normalizeError(err) {
  if (err.response) return err.response.data
  if (err.request) return { error: 1, data: 'Backend unreachable' }
  return { error: 1, data: err.message || 'Unknown error' }
}

export async function getRequest(service) {
  try {
    return (await axiosAgent.get(service)).data
  } catch (err) {
    return normalizeError(err)
  }
}

export async function postRequest(service, data = {}) {
  try {
    return (await axiosAgent.post(service, data)).data
  } catch (err) {
    return normalizeError(err)
  }
}

export async function patchRequest(service, data = {}) {
  try {
    return (await axiosAgent.patch(service, data)).data
  } catch (err) {
    return normalizeError(err)
  }
}

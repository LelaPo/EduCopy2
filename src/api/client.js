import axios from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { getHomeworkUrl, getScheduleUrl, getStudentsUrl } from './endpoints.js';
import {
  transformHomeworkResponse,
  transformScheduleResponse,
  getFirstStudentId,
} from './types.js';

/**
 * Creates and configures the API client
 * @param {Object} config - Configuration object
 * @param {string} config.baseUrl - API base URL
 * @param {string} config.bearerToken - Bearer token for authentication
 * @param {Object} config.proxy - Proxy configuration (optional)
 * @param {Function} config.onTokenExpired - Callback for token expiration (optional)
 * @returns {Object} API client instance
 */
const createApiClient = ({ baseUrl, bearerToken, proxy, onTokenExpired }) => {
  // Create axios instance
  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Set up proxy if configured
  if (proxy?.host && proxy?.port) {
    // socks-proxy-agent v8+ requires socks:// instead of socks5://
    let proxyUrl = `socks://${proxy.host}:${proxy.port}`;
    if (proxy.user && proxy.pass) {
      proxyUrl = `socks://${encodeURIComponent(proxy.user)}:${encodeURIComponent(proxy.pass)}@${proxy.host}:${proxy.port}`;
    }
    const agent = new SocksProxyAgent(proxyUrl);
    instance.defaults.httpAgent = agent;
    instance.defaults.httpsAgent = agent;
  }

  // Request interceptor - add Bearer token
  instance.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${bearerToken}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle auth errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (onTokenExpired) {
          onTokenExpired();
        }
      }
      return Promise.reject(error);
    }
  );

  /**
   * Fetches homework for a date range
   * @param {string} studentId - Student ID
   * @param {string} from - Start date (YYYY-MM-DD)
   * @param {string} to - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Homework list
   */
  const getHomework = async (studentId, from, to) => {
    const url = getHomeworkUrl(studentId, from, to);
    const response = await instance.get(url);
    return transformHomeworkResponse(response.data);
  };

  /**
   * Fetches schedule for specific dates
   * @param {string} studentId - Student ID
   * @param {Array<string>|string} dates - Date or array of dates
   * @returns {Promise<Array>} Schedule list
   */
  const getSchedule = async (studentId, dates) => {
    const url = getScheduleUrl(studentId, dates);
    const response = await instance.get(url);
    return transformScheduleResponse(response.data);
  };

  /**
   * Fetches list of students
   * @returns {Promise<Array>} Student list
   */
  const getStudents = async () => {
    const url = getStudentsUrl();
    const response = await instance.get(url);
    return response.data;
  };

  /**
   * Gets the first student ID (convenience method)
   * @returns {Promise<string|null>} Student ID
   */
  const getFirstStudent = async () => {
    const students = await getStudents();
    return getFirstStudentId(students);
  };

  return {
    instance,
    getHomework,
    getSchedule,
    getStudents,
    getFirstStudent,
  };
};

export default createApiClient;

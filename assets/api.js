const BASE_URL_API = 'https://soundmanagement.onrender.com/api/v1';
const APPKEY = 'HAHUYHEP';
const APPID = 'HIEPHAHUY';

const fetchAPI = async (url, body = null) => {
  // Show loading when call api
  document.getElementById('preloader').style.display = 'block';
  return new Promise((resolve, reject) => {
      const method = body ? 'POST' : 'GET';
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'appkey': APPKEY,
          'appid': APPID,
        }
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
      fetch(url, {...options})
      .then((response) => {
        resolve(response);
        // Remove loading when call api done
        document.getElementById('preloader').style.display = 'none';
      })
      .catch((error) => {
        reject(error);
        // Remove loading when call api done
        document.getElementById('preloader').style.display = 'none';
      })
      .finally(() => {
        // Remove loading when call api done
        document.getElementById('preloader').style.display = 'none';
      })
  });
} 
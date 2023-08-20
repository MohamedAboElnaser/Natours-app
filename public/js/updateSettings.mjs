/*eslint-disable*/
import { showAlert } from './alerts.mjs';
/*
  data : is object has the data which will sent as body req
  type : will be data or password
*/
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'data'
        ? '/api/v1/users/updateMe'
        : '/api/v1/users/updateMyPassword';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success')
      showAlert('success', `User ${type.toUpperCase()} Updated Successfully`);
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.error(err);
  }
};

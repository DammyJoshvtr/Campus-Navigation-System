import axios from 'axios'

interface SigninData {
	name?: String;
	password: String;
	email: String;
}

const api = {
  baseUrl: "http://192.168.221.171:5000"
}

const authSignin = async({email, password}: SigninData) => {
	try {
		const res = await axios.post(`${api.baseUrl}/auth/signin`, {
			email,
			password
		})

		console.log(res.data)
		return res.data

	} catch(err: any) {
		console.log("Error: ", err.response?.data || err.message)
		throw err
	}
}

export default {authSignin}
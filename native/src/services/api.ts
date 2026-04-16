import axios from 'axios'

interface SigninData {
	name: String;
	password: String;
	email: String;
}

const api = {
  baseUrl: "https://192.168.221.171:5000"
}

const authSignin = ({name, password, email}: SigninData) => {{
	try {
		const url = `${api.baseUrl}/auth/signin`;
		
		const res = axios.post(url, {
			name: name,
			password: password,
			email: email,
		})

	} catch (err) {
		console.log(err);
	}    
}}

export default {authSignin}
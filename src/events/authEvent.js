// // @ts-nocheck

// import { useAuthUser } from '$lib/authUser'
// import { currentUserStore, favouriteStore } from '../stores/appStore'
// import Api from '../utils/Api'
// import bcrypt from 'bcryptjs'

// export async function login(body) {
//     try {
//         const userResponse = await Api.get(`/users`, {
//             search: `email:${body.email}`,
//         })
//         const user = userResponse?.result[0]

//         if (!user) {
//             return {
//                 err: true,
//                 result: 'No account found with this email address.',
//             }
//         }

//         const isMatch = await bcrypt.compare(body.password, user.password)

//         if (!isMatch) {
//             return {
//                 err: true,
//                 result: 'The entered passwords do not match.',
//             }
//         } else {
//             const response = await Api.post('/auth-users', {
//                 body: {
//                     email: body.email,
//                     password: user.password,
//                 },
//                 fields: 'id, name, email',
//             })
//             return response
//         }
//     } catch (error) {
//         console.error('Error :', error)
//         return {
//             err: true,
//             result: 'An unexpected error occurred. Please try again.',
//         }
//     }
// }

// export async function register(body) {
//     try {
//         const hashedPassword = await bcrypt.hash(body.password, 10)

//         const response = await Api.post('/users', {
//             body: {
//                 name: body.name,
//                 email: body.email,
//                 password: hashedPassword,
//             },
//         })
//         return response
//     } catch (error) {
//         console.error('Error :', error)
//         return {
//             err: true,
//             result: 'An unexpected error occurred. Please try again.',
//         }
//     }
// }

// export async function changePassword(currentPassword, newPassword) {
//     try {
//         const user = useAuthUser()
//         if (!user || !user.email) {
//             return {
//                 err: true,
//                 result: 'User is not authenticated.',
//             }
//         }

//         const userResponse = await Api.get('/users', {
//             search: `email:${user.email}`,
//         })

//         if (!userResponse?.result || userResponse.result.length === 0) {
//             return {
//                 err: true,
//                 result: 'User not found.',
//             }
//         }

//         const storedHashedPassword = userResponse.result[0].password
//         const isPasswordMatch = await bcrypt.compare(
//             currentPassword,
//             storedHashedPassword
//         )

//         if (!isPasswordMatch) {
//             return {
//                 err: true,
//                 result: 'Current password is incorrect.',
//             }
//         }

//         const newHashedPassword = await bcrypt.hash(newPassword, 10)

//         const updateResponse = await Api.put(`/users/${user.id}`, {
//             body: { otp: '', password: newHashedPassword },
//         })

//         if (updateResponse?.err) {
//             return {
//                 err: true,
//                 result: 'Failed to update the password. Please try again later.',
//             }
//         }

//         return {
//             err: false,
//             result: 'Password has been updated successfully.',
//         }
//     } catch (error) {
//         console.error('Password change error:', error)
//         return {
//             err: true,
//             result: 'An unexpected error occurred. Please try again.',
//         }
//     }
// }

// export async function sendOtp(email) {
//     try {
//         const userResponse = await Api.get('/users', { search: `email:${email}` })
//         const user = userResponse.result?.[0]

//         if (!user) {
//             return { err: true, result: 'No account found with this email address.' }
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString()

//         await Api.put(`/users/${user.id}`, {
//             body: { otp },
//             fields: 'name',
//         })

//         const body = {
//             from: {
//                 name: 'Grantha Katha',
//                 email: 'connecteng@arodos.com',
//             },
//             to: [
//                 {
//                     name: user.name || 'Grantha Katha User',
//                     email,
//                 },
//             ],
//             subject: 'Your OTP for Password Reset',
//             textpart: `Your OTP is: ${otp}`,
//             htmlpart: `<p>Your <strong>OTP</strong> for resetting your password is: <b>${otp}</b></p><p>This OTP is valid for 10 minutes.</p>`,
//         }

//         const emailResponse = await fetch(
//             'https://send-email-api-v4.backendservices.in',
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(body),
//             }
//         )

//         const emailResult = await emailResponse.json()
//         console.log('Email sent response:', emailResult)

//         return {
//             err: false,
//             result: 'OTP has been sent to your email address.',
//         }
//     } catch (error) {
//         console.error('Error in sendOtp:', error)
//         return {
//             err: true,
//             result: 'An unexpected error occurred. Please try again.',
//         }
//     }
// }

// export async function verifyOtpAndUpdatePassword(email, otp, password) {
//     try {
//         const userResponse = await Api.get('/users', { search: `email:${email}` })
//         const user = userResponse.result?.[0]

//         if (user.otp != otp.toString()) {
//             return {
//                 err: true,
//                 result: 'The OTP you entered is incorrect or expired.',
//             }
//         }

//         const hashedPassword = await bcrypt.hash(password, 10)

//         await Api.put(`/users/${user.id}`, {
//             body: { otp: '', password: hashedPassword },
//         })

//         return {
//             err: false,
//             result: 'Your password has been reset successfully. Please log in.',
//         }
//     } catch (error) {
//         console.error('Error in updating password:', error)
//         return {
//             err: true,
//             result: 'An unexpected error occurred. Please try again.',
//         }
//     }
// }

// export async function updateName(newName) {
//     try {
//         const user = useAuthUser()

//         if (!user || !user.id) {
//             return {
//                 err: true,
//                 result: 'User is not authenticated.',
//             }
//         }

//         if (!newName || typeof newName !== 'string' || newName.trim().length < 5) {
//             return {
//                 err: true,
//                 result: 'Please provide a valid name.',
//             }
//         }

//         const response = await Api.put(`/users/${user.id}`, {
//             body: { name: newName.trim() },
//         })

//         if (response?.err) {
//             return {
//                 err: true,
//                 result: 'Failed to update the name. Please try again later.',
//             }
//         }

//         const userData = await Api.get(`/users/${user.id}`, {
//             hidden: 'password, otp',
//         })

//         currentUserStore.set(userData.result[0])
//         localStorage.setItem('currentUser', JSON.stringify(userData.result[0]))

//         return {
//             err: false,
//             result: 'Name updated successfully.',
//         }
//     } catch (error) {
//         console.error('Name update error:', error)
//         return {
//             err: true,
//             result: 'An unexpected error occurred while updating the name.',
//         }
//     }
// }

// export async function getFavourites() {
//     const user = useAuthUser()
//     try {
//         const response = await Api.get('/favourites', {
//             search: `user:${user.id}`,
//         })
//         favouriteStore.set(response.result)
//         localStorage.setItem('favourites', JSON.stringify(response.result))
//     } catch (error) {
//         console.error('Name update error:', error)
//         return {
//             err: true,
//             result: 'An unexpected error occurred while updating the name.',
//         }
//     }
// }

// export async function deleteAccount() {
//     const user = useAuthUser()
//     try {
//         const favouriteResponse = await Api.get('/favourites', {
//             search: `user:${user.id}`,
//         })
//         await Api.delete(
//             `/favourites/${favouriteResponse.result.map((item) => item.id).join(',')}`
//         )
//         const response = await Api.delete(`/users/${user.id}`)
//         return response
//     } catch (error) {
//         console.error('Name update error:', error)
//         return {
//             err: true,
//             result: 'An unexpected error occurred while deleting your account.',
//         }
//     }
// }

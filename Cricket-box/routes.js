const url=import.meta.env.VITE_API_KEY;

export const routes={
    signup:`${url}/api/auth/signup`,
    login:`${url}/api/auth/login`,
    getData:`${url}/api/user/box`,
    getBox:`${url}/api/user/box`,
    invitations:`${url}/api/group/my-invitations`,
    acceptinvite:`${url}/api/group/accept-userInvite`,
    createGroup:`${url}/api/group/create-group`,
    inviteGroup:`${url}/api/group/invite-group`,
    mygroup:`${url}/api/group/my-groups`,
    groupDetail:`${url}/api/group/get-group-detail`,
    createTemporary:`${url}/api/booking/create-temporary`,
    createPayment:`${url}/api/booking/create-order`,
    verifyPayment:`${url}/api/booking/confirm`,
    isAvailable:`${url}/api/booking/is-available`,
    createSettlement:`${url}/api/settlement/create`,
    viewSettlement:`${url}/api/settlement/group`,
    viewMySettlement:`${url}/api/settlement`
}

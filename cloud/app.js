const fetch = require('node-fetch')
async function getAccessToken() {
    let token = await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${process.env.appkey}&appsecret=${process.env.appsecret}`)
    let result = await token.json();
    return result.access_token
}
async function getDepartmentList(access_token) {
    let department = await fetch(`https://oapi.dingtalk.com/department/list?access_token=${access_token}`)
    let result = await department.json();
    let departmentList = result.department.filter(item=>{
        return item.parentid && item.parentid != 1 
      })
    return departmentList
}
async function getDepartmentUserList(access_token,dept_id) {
    let department = await fetch(`https://oapi.dingtalk.com/topapi/user/listsimple?access_token=${access_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'dept_id':dept_id,
            'cursor':0,
            'size':100
        })
    })
    let result = await department.json();
    return result.result.list
}
//获取用户的所有父部门列表
async function getUserDepartmentUserList(access_token,user_id) {
    let department = await fetch(`https://oapi.dingtalk.com/topapi/v2/department/listparentbyuser?access_token=${access_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'userid':user_id,
        })
    })
    let result = await department.json();
    return result.result.parent_list
}
//获取用户详情
async function getUserDetail(access_token,user_id) {
    let department = await fetch(`https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${access_token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'userid':user_id,
        })
    })
    let result = await department.json();
    return result.result
}
//获取部门详情
async function getDepartmentDetail(access_token,dept_id) {
    let department = await fetch(`https://oapi.dingtalk.com/department/get?access_token=${access_token}&id=${dept_id}&lang=zh_CN`)
    let result = await department.json();
    return result.result
}
//获取公司所有用户
async function getAllUserList(departmentList) {
    let access_token = await getAccessToken()
    console.log("getAccessToken",access_token)
    let allUserList = []
    for(let i = 0; i < departmentList.length; i ++){
        let departmentInfo = departmentList[i];
        let userList = await getDepartmentUserList(access_token,departmentInfo.id);
        userList.map(user=>{
            let index = allUserList.findIndex(item=>{
                return item.userid == user.userid
            })
            if (index == -1){
                allUserList.push(user)
            }
        })
    }
    return allUserList
}
let Member = Parse.Object.extend('Member')
//更新公司所有用户的详情
async function updateMemberInfo(memberInfo,departList) {
    let q = new Parse.Query(Member);
    q.equalTo('userid', memberInfo.userid)
    let aMember = await q.first()
    if (!aMember){
        aMember = new Member();
    }
    let res = await aMember.save({
        'userid':memberInfo.userid,
        'name': memberInfo.name,
        'avatar': memberInfo.avatar,
        'title': memberInfo.title,
        'work_place': memberInfo.work_place,
        'email': memberInfo.email,
        'departList': departList,
        'active':memberInfo.active
    }, { useMasterKey: true });
    console.log("userInfo",res.toJSON())
}


setTimeout(async() => {
    await updateDingDingData()
}, 1000);

//更新所有的用户数据
async function updateDingDingData() {
    let access_token = await getAccessToken()
    let departmentList = await getDepartmentList(access_token)
    let allUsers = await getAllUserList(departmentList)
    console.log("allUsers",allUsers)
    for (let i = 0; i < allUsers.length; i ++){
        let userInfo = allUsers[i]
        let dep_list = await getUserDepartmentUserList(access_token,userInfo.userid)
        let parent_dept_id_list = dep_list[0].parent_dept_id_list
        let dept_length = parent_dept_id_list.length;
        let dept_ids = parent_dept_id_list.length > 3 ? parent_dept_id_list.slice(dept_length-4,2) : parent_dept_id_list.slice(dept_length-3,1)
        let deptInfos = departmentList.filter(item=>{
            return dept_ids.indexOf(item.id) > -1 
        })
        let userDetail = await getUserDetail(access_token,userInfo.userid)
        updateMemberInfo(userDetail,deptInfos)
    }
}


var CronJob = require('cron').CronJob;
new CronJob('* 10 21 * * *', async function() {
    //每天晚上21:10执行一次更新
    await updateDingDingData()
}, null, true, 'Asia/Chongqing');

module.exports = {
    getAccessToken,
}
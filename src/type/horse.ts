import { Context } from "koishi"

interface HorseRes {
    id: number,
    lang: string,
    edition:  string,
    server:  string,
    content: string,
    time: number,
    created_at: number,
    report_count:number,
    status: number,
    type: string,
    subtype: string,
    map_id: number,
    map_name: string

}

export class Horse {
    baseUrl = "https://next2.jx3box.com/api/game/reporter/horse?pageIndex=1&pageSize=50"
    server: string
    type = ["horse", "chitu-horse", "dilu-horse"]
    ctx:Context
    constructor(server: string,ctx:Context) {
        this.server = server
        this.ctx=ctx
    }

    async horse(){
        const data=await this.ctx.http.get(this.baseUrl+"&server="+this.server+"&type="+this.type[0])
        if(data?.data?.list.length==0||!data?.data?.list) return '出错了喵'
        const horseList=data?.data?.list as HorseRes[]
        const [yinShan]=horseList.filter(hs=>hs.map_name=="阴山大草原"&&hs.subtype=="npc_chat")
        const [kunPen]=horseList.filter(hs=>hs.map_name=="鲲鹏岛"&&hs.subtype=="npc_chat")
        const [heiGeBi]=horseList.filter(hs=>hs.map_name=="黑戈壁"&&hs.subtype=="npc_chat")
        const [freshHorse]=horseList.filter(hs=>hs.subtype=="foreshow")
        const getText=(horse:HorseRes)=>{
            const nowTime=Math.floor(new Date().getTime())
            switch (horse.subtype){
                case "npc_chat":
                    const horseType=["龙子/麟驹","绝尘/闪电/赤蛇","里飞沙","赤兔"]
                    const content=horse.content.split('\n\n')
                    let text=''
                    for(let i=0;i<4;i++){
                        const minute=Number(content[i].match(/\d+/)?.[0])*60*1000
                        const chatTime=horse.time*1000+minute+5*60*1000
                        const chatTimeEnd=horse.time*1000+minute+10*60*1000
                        const date = new Date(chatTime)
                        const dateEnd = new Date(chatTimeEnd)
                        const hours=date.getHours()
                        const hoursEnd=dateEnd.getHours()
                        const minutes=date.getMinutes()
                        const minutesEnd=dateEnd.getMinutes()
                        text+=chatTime>nowTime&&minute?`${horseType[i]}：${hours}:${minutes}-${hoursEnd}:${minutesEnd}\n`:`${horseType[i]}:时间尚久，无法预知。\n`
                    }
                    return text
                case "foreshow":
                    const horseStart=horse.time*1000+5*60*1000
                    const horseEnd=horse.time*1000+10*60*1000
                    const dateStart = new Date(horseStart)
                    const dateEnd = new Date(horseEnd)
                    const hStart=dateStart.getHours()
                    const hEnd=dateEnd.getHours()
                    const mStart=dateStart.getMinutes()
                    const mEnd=dateEnd.getMinutes()
                    const ct=horse.content.match(/宝马良驹在(.*)出没/)?.[1]
                    const r=horseEnd>nowTime?`${ct}:${hStart}:${mStart}-${hEnd}:${mEnd}`:''
                    return r   
            }
        }
        return("阴山大草原：\n"+getText(yinShan)+"\n鲲鹏岛:\n"+getText(kunPen)+"\n黑戈壁：\n"+getText(heiGeBi)+"\n-------\n"+getText(freshHorse))
    }
    
}
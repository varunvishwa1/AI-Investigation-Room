import{Case}from'../models/Case.js';
import{Investigation}from'../models/Investigation.js';

export async function dashboard(req,res){
 const userId=req.user._id;
 const sessions=await Investigation.find({userId}).sort({updatedAt:-1}).limit(8).lean();
 const caseIds=[...new Set(sessions.map(item=>item.caseId))];
 const cases=caseIds.length?await Case.find({caseId:{$in:caseIds}}).select('caseId title difficulty').lean():[];
 const byId=new Map(cases.map(item=>[item.caseId,item]));
 const[total,solved]=await Promise.all([Investigation.countDocuments({userId}),Investigation.countDocuments({userId,status:'completed'})]);
 res.json({success:true,data:{user:{displayName:req.user.displayName},stats:{casesStarted:total,casesSolved:solved},recentInvestigations:sessions.map(item=>({investigationId:item.investigationId,caseId:item.caseId,title:byId.get(item.caseId)?.title||'Mystery case',difficulty:byId.get(item.caseId)?.difficulty||'medium',status:item.status,updatedAt:item.updatedAt}))}});
}

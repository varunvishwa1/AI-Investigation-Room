import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
 displayName:{type:String,required:true,minlength:2,maxlength:60,trim:true},
 email:{type:String,required:true,lowercase:true,trim:true,unique:true,index:true,maxlength:254},
 passwordHash:{type:String,select:false},
 googleId:{type:String,default:undefined,unique:true,sparse:true,select:false},
 role:{type:String,enum:['player','admin'],default:'player',required:true},
 onboardingCompleted:{type:Boolean,default:false},
 onboardingCurrentStep:{type:Number,default:0,min:0,max:8},
 onboardingCompletedAt:{type:Date,default:null},
},{timestamps:true});
export const User=mongoose.models.User||mongoose.model('User',userSchema);

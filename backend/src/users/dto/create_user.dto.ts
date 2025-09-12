import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto{

 
   @IsNotEmpty()
   full_name: string;
    
   @IsNotEmpty({ message: 'Email không được để trống' })
   @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;
    

   phone: string;

   cccd: string;
 
   
   sex: 'male' | 'female';
 
   avatar: string;
 


 
   
}
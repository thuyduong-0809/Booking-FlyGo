import {  IsNotEmpty } from "class-validator";

export class UpdateUserDto{

 
   @IsNotEmpty()
   full_name: string;
    
//    @IsNotEmpty({ message: 'Email không được để trống' })
//    @IsEmail({}, { message: 'Email không hợp lệ' })
//     email: string;
    
//   @IsNotEmpty({ message: 'SDT không được để trống' })
   phone: string;

   cccd: string;
   
   
   
   sex: 'male' | 'female';

   country: string;

   avatar: string;
 


 
   
}
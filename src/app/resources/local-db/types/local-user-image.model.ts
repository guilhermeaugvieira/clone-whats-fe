import { User } from "../../users/types/user.model";

export interface LocalUserImage extends User{
  imageBlob: Blob | null
}
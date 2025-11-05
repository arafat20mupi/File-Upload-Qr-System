export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    role: Role;
    password: string;
    createdAt: Date;
    updatedAt: Date;

}

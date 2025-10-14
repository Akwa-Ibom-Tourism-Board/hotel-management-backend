//================= USER ================//
interface subscriptionDetails {
    type: string;
    hasPaid: boolean;
    dateOfPayment: Date;
    dateOfExpiry: Date;
    autoRenew: boolean;
}


export interface UserAttributes {
    id: string;
    phone: string;
    fullName: string;
    userName: string;
    eventyzzeId: string;
    email: string;
    isInitialHostingOfferExhausted: boolean;
    password:string;
    role: Roles;
    refreshToken: string;
    numberOfEventsHosted: number;
    numberOfEventsAttended: number;
    bio: string;
    userImage: string;
    country: string;
    state: string;
    address: string;
    subscriptionPlan: SubscriptionPlans;
    accountStatus: AccountStatus;
    interests: any;
    isVerified: boolean;
    isBlacklisted: boolean;
    isInitialProfileSetupDone: boolean;
    noOfFollowers: number;
    noOfFollowings: number;
    otp: Record<string, any>;
    subScriptionId: string;
    activeDeviceId: any;
    subscriptionDetails: subscriptionDetails;
    freeHoursLeft:number
    newlyUpgraded: boolean;
    provider: SignupProvider;
    oauthId:string;
    oauthAccessToken:string;
    oauthRefreshToken:string;
    oauthTokenExpiresAt:string;
}

export enum SignupProvider {
    Email = "email",
    Google = "google",
    Facebook = "facebook"
}

export enum Roles {
    User = "User",
    Host = "Host",
    Event = "Event",
    SuperAdmin = "SuperAdmin",
    FinanceAdmin = "FinanceAdmin",
    PeopleAdmin = "PeopleAdmin",
    ProcessAdmin = "ProcessAdmin"
}

export enum SubscriptionPlans {
    Free = "Free",
    Bronze = "Bronze",
    Silver = "Silver",
    Gold = "Gold",
    Platinum = "Platinum"
}

export enum AccountStatus {
    Active = "Active",
    Frozen = "Frozen",
    Deactivated = "Deactivated"
}
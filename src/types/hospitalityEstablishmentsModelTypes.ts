export enum EntityType {
  Hotel = "hotel",
  Bar = "bar",
  Restaurant = "restaurant",
  Lounge = "lounge",
  TourOperator = "tour_operator",
  TravelAgent = "travel_agent",
  HospitalityOrg = "hospitality_org",
  Other = "other"
}


export enum RegistrationStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  UnderReview = "under_review"
}

export interface BusinessRegistrationAttributes {
  id: string;
  uniqueBusinessId: string;
  
  // Common fields
  entityType: EntityType;
  businessName: string;
  businessPhoneNumber: string;
  phoneVerified: boolean;
  address: string;
  localGovernment: string;
  hasWebsite: boolean;
  website?: string;
  yearEstablished: number;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  businessEmail: string;
  
  // Hotel-specific fields
  roomCount?: number;
  bedSpaces?: number;
  facilities?: string[];
  
  // Restaurant/Lounge/Bar-specific fields
  seatingCapacity?: number;
  serviceTypes?: string[];
  
  // Other inputs (for "Other" options in checkboxes)
  // otherInputs?: Record<string, string>;
  
  // Metadata
  registrationStatus: RegistrationStatus;
  submittedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}




//============= ESTABLISHMENT COUNTER MODEL TYPES =============//

export interface EstablishmentCounterAttributes {
  id?: string;
  prefix: string;
  lastNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
}
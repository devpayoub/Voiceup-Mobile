export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Company = {
  id: number;
  name: string;
  sector: string;
  verified: boolean;
};

export type Region = {
  id: number;
  name: string;
};

export type Status = "received" | "in_progress" | "resolved";

export type Complaint = {
  id: number;
  user: string;
  company: number;
  category: number;
  title: string;
  description: string;
  photo: string | null;
  region: string;
  city: string;
  status: Status;
  created_at: string;
  updated_at: string;
  backer_count: number;
  comment_count: number;
  is_backed_by_me: boolean;
};

export type Comment = {
  id: number;
  complaint: number;
  user: string;
  text: string;
  created_at: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  phone: string;
  region: string;
  date_joined: string;
};

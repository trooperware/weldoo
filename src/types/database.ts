export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row<T> = T;
type Insert<T> = Partial<T>;
type Update<T> = Partial<T>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Row<{
          id: string;
          profile_type: Database["public"]["Enums"]["profile_type"];
          status: Database["public"]["Enums"]["profile_status"];
          display_name: string;
          headline: string | null;
          bio: string | null;
          location: string | null;
          website_url: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      professional_profiles: {
        Row: Row<{
          profile_id: string;
          years_experience: number | null;
          availability: Database["public"]["Enums"]["availability_status"];
          welding_processes: string[];
          materials: string[];
          positions: string[];
          certifications: string[];
          work_preferences: string[];
          travel_availability: boolean;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["professional_profiles"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["professional_profiles"]["Row"]>;
        Relationships: [];
      };
      companies: {
        Row: Row<{
          id: string;
          owner_profile_id: string;
          name: string;
          sector: string | null;
          company_size: string | null;
          location: string | null;
          description: string | null;
          website_url: string | null;
          contact_email: string | null;
          logo_url: string | null;
          cover_url: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["companies"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["companies"]["Row"]>;
        Relationships: [];
      };
      training_providers: {
        Row: Row<{
          id: string;
          owner_profile_id: string;
          name: string;
          location: string | null;
          description: string | null;
          website_url: string | null;
          contact_email: string | null;
          training_types: string[];
          logo_url: string | null;
          cover_url: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["training_providers"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["training_providers"]["Row"]>;
        Relationships: [];
      };
      posts: {
        Row: Row<{
          id: string;
          author_profile_id: string;
          body: string;
          image_url: string | null;
          image_urls: string[];
          status: Database["public"]["Enums"]["publication_status"];
          tags: string[];
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["posts"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["posts"]["Row"]>;
      };
      comments: {
        Row: Row<{
          id: string;
          post_id: string;
          author_profile_id: string;
          body: string;
          status: Database["public"]["Enums"]["publication_status"];
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["comments"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["comments"]["Row"]>;
      };
      likes: {
        Row: Row<{ id: string; post_id: string; profile_id: string; created_at: string }>;
        Insert: Insert<Database["public"]["Tables"]["likes"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["likes"]["Row"]>;
      };
      saved_items: {
        Row: Row<{
          id: string;
          profile_id: string;
          item_type: Database["public"]["Enums"]["saved_item_type"];
          post_id: string | null;
          job_id: string | null;
          course_event_id: string | null;
          created_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["saved_items"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["saved_items"]["Row"]>;
      };
      connections: {
        Row: Row<{
          id: string;
          requester_profile_id: string;
          recipient_profile_id: string;
          status: Database["public"]["Enums"]["connection_status"];
          message: string | null;
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["connections"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["connections"]["Row"]>;
      };
      contact_requests: {
        Row: Row<{
          id: string;
          sender_profile_id: string;
          recipient_profile_id: string;
          message: string;
          read_at: string | null;
          archived_at: string | null;
          created_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["contact_requests"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["contact_requests"]["Row"]>;
      };
      jobs: {
        Row: Row<{
          id: string;
          company_id: string;
          created_by_profile_id: string;
          title: string;
          description: string;
          responsibilities: string | null;
          requirements: string | null;
          location: string | null;
          work_mode: Database["public"]["Enums"]["work_mode"] | null;
          contract_type: Database["public"]["Enums"]["contract_type"] | null;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          welding_processes: string[];
          materials: string[];
          required_certifications: string[];
          experience_level: string | null;
          travel_required: boolean;
          benefits: string[];
          status: Database["public"]["Enums"]["publication_status"];
          published_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["jobs"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["jobs"]["Row"]>;
      };
      job_applications: {
        Row: Row<{
          id: string;
          job_id: string;
          applicant_profile_id: string;
          message: string | null;
          cv_url: string | null;
          external_cv_url: string | null;
          status: Database["public"]["Enums"]["application_status"];
          viewed_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["job_applications"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["job_applications"]["Row"]>;
      };
      course_events: {
        Row: Row<{
          id: string;
          training_provider_id: string;
          created_by_profile_id: string;
          type: Database["public"]["Enums"]["course_event_type"];
          level: Database["public"]["Enums"]["course_level"] | null;
          title: string;
          description: string;
          agenda: string | null;
          topics: string[];
          welding_processes: string[];
          location: string | null;
          online_url: string | null;
          external_registration_url: string | null;
          recording_url: string | null;
          starts_at: string | null;
          ends_at: string | null;
          duration_text: string | null;
          capacity: number | null;
          price_text: string | null;
          status: Database["public"]["Enums"]["publication_status"];
          published_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["course_events"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["course_events"]["Row"]>;
      };
      course_event_interests: {
        Row: Row<{
          id: string;
          course_event_id: string;
          profile_id: string;
          note: string | null;
          archived_at: string | null;
          created_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["course_event_interests"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["course_event_interests"]["Row"]>;
      };
      notifications: {
        Row: Row<{
          id: string;
          recipient_profile_id: string;
          actor_profile_id: string | null;
          type: Database["public"]["Enums"]["notification_type"];
          title: string;
          body: string | null;
          target_path: string | null;
          read_at: string | null;
          created_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["notifications"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      reports: {
        Row: Row<{
          id: string;
          reporter_profile_id: string;
          target_type: Database["public"]["Enums"]["report_target_type"];
          post_id: string | null;
          comment_id: string | null;
          profile_id: string | null;
          job_id: string | null;
          course_event_id: string | null;
          reason: string;
          note: string | null;
          status: Database["public"]["Enums"]["report_status"];
          reviewed_by_profile_id: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Insert: Insert<Database["public"]["Tables"]["reports"]["Row"]>;
        Update: Update<Database["public"]["Tables"]["reports"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      profile_type: "professional" | "company" | "training_provider" | "admin";
      profile_status: "onboarding" | "active" | "deactivated";
      availability_status: "available" | "open_to_opportunities" | "not_available";
      connection_status: "pending" | "accepted" | "rejected" | "cancelled";
      publication_status: "draft" | "published" | "closed" | "archived" | "removed";
      work_mode: "on_site" | "hybrid" | "remote";
      contract_type: "full_time" | "part_time" | "contract" | "temporary" | "freelance";
      application_status: "submitted" | "viewed" | "contacted" | "rejected";
      course_event_type:
        | "online_course"
        | "webinar"
        | "in_person_course"
        | "workshop"
        | "sector_event";
      course_level: "basic" | "intermediate" | "advanced";
      saved_item_type: "post" | "job" | "course_event";
      report_target_type: "post" | "comment" | "profile" | "job" | "course_event";
      report_status: "open" | "reviewed" | "dismissed" | "action_taken";
      notification_type:
        | "connection_request"
        | "connection_accepted"
        | "post_like"
        | "post_comment"
        | "contact_request"
        | "job_application"
        | "course_event_interest";
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

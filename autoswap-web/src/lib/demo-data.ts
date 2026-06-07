import type { Conversation, Offer, Vehicle } from "@/lib/types";

export const demoVehicles: Vehicle[] = [
  {
    id: "demo-audi-a6",
    owner_id: "demo-owner-a",
    make: "Audi",
    model: "A6",
    year: 2021,
    mileage: 69000,
    fuel_type: "diesel",
    transmission: "automatic",
    location: "თბილისი",
    description:
      "სუფთა A6 სრული სერვის წიგნით, ახალი საბურავებით და მზრუნველი მფლობელით. ეძებს პრემიუმ SUV-ს ან უფრო ახალ ჰიბრიდულ სედანს.",
    listing_type: "swap",
    cash_adjustment: 2000,
    status: "active",
    vehicle_photos: [
      {
        url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=85",
        position: 0
      },
      {
        url: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=85",
        position: 1
      }
    ],
    desired_vehicles: [
      {
        desired_make: "BMW",
        desired_model: "X5",
        desired_category: "SUV"
      }
    ],
    profiles: {
      id: "demo-owner-a",
      display_name: "ნიკა",
      phone: null,
      avatar_url: null
    }
  },
  {
    id: "demo-bmw-530i",
    owner_id: "demo-owner-b",
    make: "BMW",
    model: "530i",
    year: 2020,
    mileage: 82000,
    fuel_type: "petrol",
    transmission: "automatic",
    location: "ბათუმი",
    description:
      "Sport line 530i, ბოქსში ნაყოლი, ამ თვეში გავლილი ინსპექცია. მფლობელი დაუმატებს თანხას ელექტრო SUV-ის სანაცვლოდ.",
    listing_type: "swap",
    cash_adjustment: -1500,
    status: "active",
    vehicle_photos: [
      {
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85",
        position: 0
      }
    ],
    desired_vehicles: [
      {
        desired_make: "Tesla",
        desired_model: "Model Y",
        desired_category: "Electric"
      }
    ],
    profiles: {
      id: "demo-owner-b",
      display_name: "მარიამ",
      phone: null,
      avatar_url: null
    }
  },
  {
    id: "demo-lexus-rx",
    owner_id: "demo-owner-c",
    make: "Lexus",
    model: "RX 450h",
    year: 2019,
    mileage: 91000,
    fuel_type: "hybrid",
    transmission: "automatic",
    location: "ქუთაისი",
    description:
      "ჰიბრიდი SUV მშვიდი სალონითა და ძლიერი მომსახურების ისტორიით. სასურველია პირდაპირი გაცვლა ბიზნეს კლასის სედანზე.",
    listing_type: "swap",
    cash_adjustment: 0,
    status: "active",
    vehicle_photos: [
      {
        url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=85",
        position: 0
      }
    ],
    desired_vehicles: [
      {
        desired_make: "Mercedes-Benz",
        desired_model: "E-Class",
        desired_category: "Sedan"
      }
    ],
    profiles: {
      id: "demo-owner-c",
      display_name: "გიორგი",
      phone: null,
      avatar_url: null
    }
  },
  {
    id: "demo-toyota-landcruiser",
    owner_id: "demo-owner-d",
    make: "Toyota",
    model: "Land Cruiser 200",
    year: 2018,
    mileage: 124000,
    fuel_type: "diesel",
    transmission: "automatic",
    location: "თბილისი",
    description:
      "სრულად აღჭურვილი Land Cruiser, ერთი მფლობელი. ეძებს პრემიუმ სედანს ან კუპეს, თანხის გარეშე.",
    listing_type: "swap",
    cash_adjustment: 0,
    status: "active",
    vehicle_photos: [
      {
        url: "https://images.unsplash.com/photo-1597007030739-6d2e7172ee0a?auto=format&fit=crop&w=1200&q=85",
        position: 0
      }
    ],
    desired_vehicles: [
      {
        desired_make: "Mercedes-Benz",
        desired_model: "S-Class",
        desired_category: "Sedan"
      }
    ],
    profiles: {
      id: "demo-owner-d",
      display_name: "დათო",
      phone: null,
      avatar_url: null
    }
  },
  {
    id: "demo-vw-golf-gti",
    owner_id: "demo-owner-e",
    make: "Volkswagen",
    model: "Golf GTI",
    year: 2022,
    mileage: 38000,
    fuel_type: "petrol",
    transmission: "manual",
    location: "თბილისი",
    description:
      "ცოცხალი Golf GTI, ფაბრიკული მდგომარეობა. მფლობელი ცვლის უფრო პრაქტიკულ ოჯახურ ავტომობილზე.",
    listing_type: "swap",
    cash_adjustment: 3500,
    status: "active",
    vehicle_photos: [
      {
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85",
        position: 0
      }
    ],
    desired_vehicles: [
      {
        desired_make: "Toyota",
        desired_model: "RAV4",
        desired_category: "Crossover"
      }
    ],
    profiles: {
      id: "demo-owner-e",
      display_name: "ლუკა",
      phone: null,
      avatar_url: null
    }
  },
  {
    id: "demo-porsche-cayenne",
    owner_id: "demo-owner-f",
    make: "Porsche",
    model: "Cayenne",
    year: 2017,
    mileage: 110000,
    fuel_type: "petrol",
    transmission: "automatic",
    location: "ბათუმი",
    description:
      "Cayenne S სრული ისტორიით, panorama და air suspension. სასურველი — სპორტული კუპე ან კაბრიოლეტი.",
    listing_type: "swap",
    cash_adjustment: -2500,
    status: "active",
    vehicle_photos: [
      {
        url: "https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?auto=format&fit=crop&w=1200&q=85",
        position: 0
      }
    ],
    desired_vehicles: [
      {
        desired_make: "BMW",
        desired_model: "M4",
        desired_category: "Coupe"
      }
    ],
    profiles: {
      id: "demo-owner-f",
      display_name: "სანდრო",
      phone: null,
      avatar_url: null
    }
  }
];

export const demoOffers: Offer[] = [];
export const demoConversations: Conversation[] = [];

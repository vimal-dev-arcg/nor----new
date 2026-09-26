import john from "../img/agents/John.jpeg";
import sudhir from "../img/agents/sudhir.png";
import Krishan from "../img/agents/Krishan.jpeg";
import rusu from "../img/agents/Rusudan.jpeg";
import dr from "../img/agents/Vijay.jpeg";
import kundan from "../img/agents/Kundan.jpeg";
import navjeet from "../img/agents/Navjeet.png";
import Anushka from "../img/agents/Anushka.jpeg";
import Shekhar from "../img/agents/shekhar.jpeg";

export const LEADERSHIP_TEAM = [
  {
    id: 1,
    name: "Sudhir B Datta",
    role: "Managing Partner",
    category: "leadership",
    photo: sudhir,
  },
  {
    id: 2,
    name: "Shekhar Kallianpur",
    role: "Life Coach & Mentor",
    subRole: "Advisor To The Board",
    category: "leadership",
    photo: Shekhar,
  },
  {
    id: 3,
    name: "Rusudan Tsintsadze",
    role: "Advisor To The Board",
    category: "leadership",
    photo: rusu,
  },
  {
    id: 4,
    name: "Dr Vijay Raghavan",
    role: "CGHRO",
    subRole: "Co-founder DRCHRO",
    category: "leadership",
    photo: dr,
  },
  {
    id: 5,
    name: "Kundan S.Rawat",
    role: "Director Finance",
    category: "leadership",
    photo: kundan,
  },
  {
    id: 6,
    name: "Krishan Veer",
    role: "Director - Corporate Affairs",
    category: "leadership",
    photo: Krishan,
  },
  {
    id: 7,
    name: "John Prakash Jha",
    role: "Associate Director",
    category: "leadership",
    photo: john,
  },
  {
    id: 8,
    name: "Navjeet Singh",
    role: "MARCOM",
    category: "leadership",
    photo: navjeet,
  },
];

export const INTERNSHIP_PROGRAM_TEAM = [
  {
    id: 9,
    name: "Anushka Datta",
    role: "Agency Network",
    subRole: "Internship Program",
    category: "internship",
    department: "Agency Network & Strategic Partnerships",
    bio: "Focusing on strategic agency network coordination, developer launch relations, and cross-border partnership channels across Dubai & India.",
    photo: Anushka,
  },
  {
    id: 10,
    name: "Nandini Saanchi Sharma",
    role: "Client Advisory & Market Intelligence",
    subRole: "Internship Program",
    category: "internship",
    department: "Client Advisory & Research",
    bio: "Specializing in real estate transaction intelligence, buyer portfolio research, and cross-border NRI investment coordination.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
  },
];

// Default export combines all members with category flags
export default [
  ...LEADERSHIP_TEAM,
  ...INTERNSHIP_PROGRAM_TEAM,
];

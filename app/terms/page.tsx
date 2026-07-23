"use client";

import Link from "next/link";
import { useState } from "react";
import { FooterSection } from "@/components/landing/FooterSection";

const parts = [
  {
    id: "part-1",
    title: "Part I",
    subtitle: "User Account, Eligibility & Acceptance of Terms",
    clauses: [
      {
        id: "clause-1",
        number: 1,
        heading: "Acceptance of Terms",
        content: `By accessing, browsing, registering on, or using the HelpMeMan Platform ("Platform"), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms & Conditions, the Privacy Policy, Cookie Policy, Refund Policy, Community Guidelines, and all other policies published by HelpMeMan from time to time. If you do not agree with any provision of these Terms, you must immediately discontinue use of the Platform. Your continued use of the Platform constitutes your unconditional acceptance of these Terms.`,
      },
      {
        id: "clause-2",
        number: 2,
        heading: "About HelpMeMan",
        content: `HelpMeMan is a digital mentorship platform that enables users ("Mentees") to discover, connect with, schedule sessions with, and receive mentorship from independent professionals ("Mentors") across multiple domains including, but not limited to:`,
        list: [
          "Engineering Entrance Examinations (JEE)",
          "Medical Entrance Examinations (NEET)",
          "Law Entrance Examinations (CLAT)",
          "Fitness & Gym Guidance",
          "Career Development",
          "Technology",
          "Entrepreneurship",
          "Personal Growth",
          "Other educational and professional categories introduced by HelpMeMan from time to time.",
        ],
        listSuffix: `HelpMeMan acts solely as a technology platform facilitating communication, scheduling, payments, and mentorship sessions. Unless expressly stated otherwise, HelpMeMan does not employ mentors nor guarantee any particular academic, career, financial, fitness, or professional outcome.`,
      },
      {
        id: "clause-3",
        number: 3,
        heading: "Eligibility",
        content: `You may use the Platform only if:\n(a) You are at least 18 years of age; OR\n(b) You are under 18 years of age and have obtained valid consent from your parent or legal guardian.\n\nBy creating an account, you represent and warrant that:`,
        list: [
          "All information provided is true, complete, and accurate.",
          "You possess the legal capacity to enter into binding agreements.",
          "You shall comply with all applicable laws.",
        ],
      },
      {
        id: "clause-4",
        number: 4,
        heading: "User Registration",
        content: `To access certain features, users may be required to register an account. Registration may be completed through:`,
        list: [
          "Email & OTP Verification",
          "Google Authentication",
          "Other authentication methods introduced by HelpMeMan.",
        ],
        listSuffix: `Users agree to maintain the confidentiality of their login credentials and shall remain solely responsible for all activities carried out under their account. HelpMeMan shall not be liable for any unauthorized access resulting from the user's failure to maintain account security.`,
      },
      {
        id: "clause-5",
        number: 5,
        heading: "Information Collected During Registration",
        content: `By registering, users consent to the collection and processing of the following information:`,
        subSections: [
          {
            title: "Mandatory Information",
            items: [
              "Full Name",
              "Email Address",
              "Account Identifier",
              "Authentication Credentials",
              "Encrypted Password (where applicable)",
            ],
          },
          {
            title: "Optional Information",
            items: [
              "Mobile Number",
              "Preferred Display Name",
              "Avatar/Profile Picture",
              "Personal Preferences",
              "Profile Information voluntarily submitted by the User.",
            ],
          },
        ],
        listSuffix: `Such information shall be processed strictly in accordance with the Privacy Policy and applicable provisions of the Digital Personal Data Protection Act, 2023.`,
      },
      {
        id: "clause-6",
        number: 6,
        heading: "Google Authentication",
        content: `Where a user chooses "Continue with Google," HelpMeMan may access the following information after receiving the user's explicit consent:`,
        list: [
          "Google Name",
          "Email Address",
          "Profile Photograph",
          "Google Account Identifier",
        ],
        listSuffix: `No passwords associated with the user's Google account are collected or stored by HelpMeMan. Users may revoke such permissions through their Google Account settings at any time.`,
      },
      {
        id: "clause-7",
        number: 7,
        heading: "Account Security",
        content: `Users shall:`,
        list: [
          "Keep login credentials confidential.",
          "Notify HelpMeMan immediately upon discovering unauthorized access.",
          "Not share their account with any third party.",
          "Not impersonate another individual.",
          "Not create fake or misleading identities.",
        ],
        listSuffix: `HelpMeMan reserves the right to suspend or permanently terminate accounts suspected of fraudulent activity.`,
      },
      {
        id: "clause-8",
        number: 8,
        heading: "User Responsibilities",
        content: `Users agree that they shall not:`,
        list: [
          "Provide false or misleading information.",
          "Upload forged identity documents.",
          "Misrepresent qualifications or credentials.",
          "Interfere with Platform operations.",
          "Attempt unauthorized access.",
          "Circumvent payment mechanisms.",
          "Abuse mentors or other users.",
          "Upload malicious software.",
          "Use automated bots or scraping tools.",
          "Violate any applicable law.",
        ],
        listSuffix: `Violation of this clause may result in immediate suspension or permanent removal from the Platform without prior notice.`,
      },
    ],
  },
  {
    id: "part-2",
    title: "Part II",
    subtitle: "Bookings, Payments, Mentorship Services & User Conduct",
    clauses: [
      {
        id: "clause-9",
        number: 9,
        heading: "Nature of Services",
        content: `HelpMeMan provides a technology platform that enables Users to discover, connect with, schedule, and participate in mentorship sessions conducted by independent mentors. HelpMeMan facilitates discovery, communication, scheduling, payment processing, AI-assisted guidance, and session management but does not itself provide professional educational, career, legal, financial, medical, psychological, or fitness advice. Mentors act independently and are solely responsible for the content, opinions, guidance, and recommendations shared during mentorship sessions.`,
      },
      {
        id: "clause-10",
        number: 10,
        heading: "Booking of Mentorship Sessions",
        content: `Users may book mentorship sessions through the Platform by selecting an available mentor, preferred date, time, and session duration. A booking shall be deemed confirmed only after:`,
        list: [
          "Successful payment (where applicable);",
          "Availability confirmation by the Platform or Mentor;",
          "Generation of a valid booking confirmation.",
        ],
        listSuffix: `HelpMeMan reserves the right to reject, reschedule, or cancel bookings due to technical issues, mentor unavailability, suspected fraud, policy violations, or force majeure events.`,
      },
      {
        id: "clause-11",
        number: 11,
        heading: "Session Duration & Scheduling",
        content: `Each mentorship session shall be conducted for the duration selected during booking. Users are responsible for joining sessions on time using the meeting link generated through the Platform. Failure to join within the scheduled time may result in reduced session duration or forfeiture of the session, subject to the applicable Cancellation and Refund Policy.`,
      },
      {
        id: "clause-12",
        number: 12,
        heading: "Online Meeting Services",
        content: `HelpMeMan may generate meeting links using third-party conferencing providers, including Google Meet or any other integrated communication platform. Users acknowledge that such services are governed by the respective third-party terms and privacy policies. HelpMeMan shall not be liable for interruptions, outages, connectivity failures, or service disruptions caused by third-party providers.`,
      },
      {
        id: "clause-13",
        number: 13,
        heading: "Payments",
        content: `Payments for mentorship sessions shall be processed through authorized third-party payment gateways integrated into the Platform. The Platform may collect and process:`,
        list: [
          "Payment Order ID",
          "Transaction Reference Number",
          "Payment Status",
          "Refund Status",
          "Payment Timestamp",
          "Booking Reference ID",
        ],
        listSuffix: `HelpMeMan does not store complete debit card, credit card, UPI PIN, CVV, or banking credentials.`,
      },
      {
        id: "clause-14",
        number: 14,
        heading: "Pricing",
        content: `Mentorship fees are determined by individual mentors or by HelpMeMan where applicable. Prices displayed at the time of booking shall be considered final unless modified before payment completion. HelpMeMan reserves the right to revise platform fees, service charges, taxes, or pricing structures at any time.`,
      },
      {
        id: "clause-15",
        number: 15,
        heading: "Cancellation & Rescheduling",
        content: `Cancellation and rescheduling shall be governed by the Platform's Refund & Cancellation Policy. Depending on the circumstances, HelpMeMan may:`,
        list: [
          "Allow free rescheduling;",
          "Provide partial refunds;",
          "Provide full refunds;",
          "Decline refund requests where policy conditions are not satisfied.",
        ],
        listSuffix: `Repeated abuse of cancellation policies may result in account suspension.`,
      },
      {
        id: "clause-16",
        number: 16,
        heading: "Refunds",
        content: `Refund eligibility shall depend upon:`,
        list: [
          "Mentor cancellation;",
          "Technical failure attributable to the Platform;",
          "Duplicate payments;",
          "Payment gateway errors;",
          "Other circumstances determined by HelpMeMan.",
        ],
        listSuffix: `Approved refunds shall be processed through the original payment method within the timelines prescribed by the payment gateway. Processing timelines may vary depending upon banking institutions.`,
      },
      {
        id: "clause-17",
        number: 17,
        heading: "Mentor Independence",
        content: `All mentors listed on the Platform are independent professionals. Unless expressly stated otherwise:`,
        list: [
          "Mentors are not employees of HelpMeMan.",
          "Mentors are not legal representatives of HelpMeMan.",
          "Opinions expressed by mentors are their own.",
        ],
        listSuffix: `HelpMeMan does not endorse any specific advice, strategy, recommendation, or opinion shared by mentors.`,
      },
      {
        id: "clause-18",
        number: 18,
        heading: "No Guarantee of Results",
        content: `HelpMeMan does not guarantee:`,
        list: [
          "Examination success;",
          "College admissions;",
          "Job placement;",
          "Salary increments;",
          "Career advancement;",
          "Business success;",
          "Fitness transformation;",
          "Medical improvement;",
          "Any specific personal or professional outcome.",
        ],
        listSuffix: `Mentorship provides guidance only, and actual outcomes depend upon individual effort, preparation, skills, circumstances, and external factors beyond the Platform's control.`,
      },
      {
        id: "clause-19",
        number: 19,
        heading: "User Conduct During Sessions",
        content: `Users shall conduct themselves respectfully throughout all mentorship interactions. Users shall not:`,
        list: [
          "Harass mentors;",
          "Use abusive or offensive language;",
          "Engage in hate speech;",
          "Share unlawful content;",
          "Record sessions without authorization where prohibited;",
          "Threaten or intimidate mentors;",
          "Disrupt scheduled sessions;",
          "Request illegal activities or unethical assistance.",
        ],
        listSuffix: `Violation of this clause may result in immediate suspension without refund.`,
      },
      {
        id: "clause-20",
        number: 20,
        heading: "AI Assistant (Ruth AI)",
        content: `The Platform may provide access to an AI-powered assistant ("Ruth AI") for informational and educational purposes. Users acknowledge that:`,
        list: [
          "AI-generated responses are automated.",
          "Responses may occasionally be inaccurate, incomplete, or outdated.",
          "AI should not be relied upon as a substitute for professional advice.",
          "Important decisions should be verified independently or discussed with a qualified mentor.",
        ],
        listSuffix: `HelpMeMan shall not be liable for any loss arising from reliance on AI-generated content.`,
      },
      {
        id: "clause-21",
        number: 21,
        heading: "Chat & Communication",
        content: `The Platform may provide messaging and communication features between mentors and mentees. Users agree that messages exchanged through the Platform may be stored, processed, and reviewed where necessary for:`,
        list: [
          "Service delivery;",
          "Safety and moderation;",
          "Fraud prevention;",
          "Customer support;",
          "Legal compliance;",
          "Platform improvement.",
        ],
        listSuffix: `Private conversations shall not be disclosed except where required by law or permitted under the Privacy Policy.`,
      },
      {
        id: "clause-22",
        number: 22,
        heading: "Community Standards",
        content: `Every user agrees to maintain a respectful, professional, and safe environment. HelpMeMan maintains a zero-tolerance policy against:`,
        list: [
          "Harassment;",
          "Bullying;",
          "Discrimination;",
          "Impersonation;",
          "Fraud;",
          "Spam;",
          "Malicious activities;",
          "Illegal content;",
          "Intellectual property infringement.",
        ],
        listSuffix: `HelpMeMan reserves the right to remove content, suspend accounts, or permanently prohibit access without prior notice where such conduct is detected.`,
      },
    ],
  },
  {
    id: "part-3",
    title: "Part III",
    subtitle: "Privacy, Data Processing & Digital Personal Data Protection",
    clauses: [
      {
        id: "clause-23",
        number: 23,
        heading: "Collection of Personal Data",
        content: `By accessing or using the Platform, Users expressly consent to the collection, storage, processing, and use of their personal data by HelpMeMan in accordance with these Terms, the Privacy Policy, and the Digital Personal Data Protection Act, 2023 ("DPDPA"). Personal Data may be collected directly from Users during registration, profile creation, mentorship bookings, communications, payment transactions, AI interactions, customer support requests, and use of Platform features.`,
      },
      {
        id: "clause-24",
        number: 24,
        heading: "Categories of Data Collected",
        content: `HelpMeMan may collect and process the following categories of information:`,
        subSections: [
          {
            title: "(a) Account Information",
            items: [
              "Full Name",
              "Display Name",
              "Email Address",
              "Mobile Number (Optional)",
              "Profile Photograph",
              "User ID",
              "Authentication Credentials",
              "Google Account Information (where applicable)",
            ],
          },
          {
            title: "(b) Booking Information",
            items: [
              "Mentor Selected",
              "Booking Date & Time",
              "Session Duration",
              "Booking Status",
              "Meeting Link",
              "Session Notes",
              "Booking Reference Number",
            ],
          },
          {
            title: "(c) Payment Information",
            items: [
              "Transaction ID",
              "Razorpay Order ID",
              "Payment Status",
              "Refund Status",
              "Payment Timestamp",
            ],
          },
          {
            title: "(d) Communication Information",
            items: [
              "Messages exchanged with Mentors",
              "Customer Support Communications",
              "Complaint Records",
              "Read Status",
              "Communication Metadata",
            ],
          },
          {
            title: "(e) AI Interaction Data",
            items: [
              "User Prompts",
              "AI Responses",
              "Session Context",
              "Conversation History",
              "Technical Metadata",
            ],
          },
          {
            title: "(f) Technical Information",
            items: [
              "IP Address",
              "Device Information",
              "Browser Information",
              "Operating System",
              "Device Tokens",
              "Log Files",
              "Cookies",
              "Crash Reports",
              "Diagnostic Data",
            ],
          },
        ],
        listSuffix: `HelpMeMan does not store complete debit card, credit card, CVV, UPI PIN, or internet banking credentials. Where Users interact with Ruth AI, information such as user prompts, AI responses, session context, conversation history, and technical metadata may be used to improve AI quality, maintain conversation continuity, detect misuse, and enhance Platform performance.`,
      },
      {
        id: "clause-25",
        number: 25,
        heading: "Purpose of Processing",
        content: `HelpMeMan processes Personal Data solely for legitimate business purposes, including but not limited to:`,
        list: [
          "Creating and managing user accounts;",
          "Verifying identity;",
          "Scheduling mentorship sessions;",
          "Processing payments and refunds;",
          "Providing customer support;",
          "Facilitating mentor-mentee communication;",
          "Sending OTPs, notifications, and transactional emails;",
          "Improving AI responses and Platform functionality;",
          "Preventing fraud and abuse;",
          "Maintaining security;",
          "Complying with legal obligations;",
          "Enforcing these Terms & Conditions.",
        ],
        listSuffix: `Personal Data shall not be processed for unlawful or unauthorized purposes.`,
      },
      {
        id: "clause-26",
        number: 26,
        heading: "Consent",
        content: `By creating an account or using the Platform, Users provide free, specific, informed, unconditional, and unambiguous consent for the processing of their Personal Data as described in these Terms and the Privacy Policy. Where consent is required by applicable law, Users may withdraw such consent at any time. Withdrawal of consent may affect the availability of certain Platform features.`,
      },
      {
        id: "clause-27",
        number: 27,
        heading: "Sharing of Personal Data",
        content: `HelpMeMan does not sell Users' Personal Data. Personal Data may only be shared with:`,
        list: [
          "Payment Gateway Providers;",
          "Cloud Hosting Providers;",
          "Authentication Providers;",
          "Communication Service Providers;",
          "Calendar & Meeting Service Providers;",
          "Government Authorities where legally required;",
          "Professional Advisors, Auditors, or Legal Counsel subject to confidentiality obligations.",
        ],
        listSuffix: `All third-party service providers are required to process Personal Data in accordance with applicable law.`,
      },
      {
        id: "clause-28",
        number: 28,
        heading: "Cookies & Similar Technologies",
        content: `The Platform may use cookies, local storage, pixels, and similar technologies to:`,
        list: [
          "Authenticate Users;",
          "Maintain login sessions;",
          "Remember user preferences;",
          "Improve Platform performance;",
          "Analyse usage patterns;",
          "Detect fraudulent activity;",
          "Enhance user experience.",
        ],
        listSuffix: `Users may manage cookie preferences through their browser settings; however, disabling certain cookies may affect Platform functionality.`,
      },
      {
        id: "clause-29",
        number: 29,
        heading: "Data Security",
        content: `HelpMeMan implements reasonable technical, organizational, and administrative safeguards designed to protect Personal Data against unauthorized access, disclosure, alteration, destruction, or misuse. Such safeguards may include:`,
        list: [
          "Encryption in transit and at rest (where applicable);",
          "Secure authentication mechanisms;",
          "Role-based access controls;",
          "Audit logs;",
          "Regular security monitoring;",
          "Secure cloud infrastructure.",
        ],
        listSuffix: `While HelpMeMan strives to protect Personal Data, no method of electronic storage or transmission over the Internet can be guaranteed to be completely secure.`,
      },
      {
        id: "clause-30",
        number: 30,
        heading: "Data Retention",
        content: `Personal Data shall be retained only for as long as necessary to:`,
        list: [
          "Provide Platform services;",
          "Maintain business records;",
          "Resolve disputes;",
          "Enforce legal rights;",
          "Comply with statutory obligations;",
          "Prevent fraud and abuse.",
        ],
        listSuffix: `Upon expiry of the applicable retention period, Personal Data shall be securely deleted, anonymized, or archived in accordance with applicable law.`,
      },
      {
        id: "clause-31",
        number: 31,
        heading: "Rights of Users",
        content: `Subject to applicable law, Users may have the right to:`,
        list: [
          "Access their Personal Data;",
          "Correct inaccurate information;",
          "Update profile details;",
          "Withdraw consent (where applicable);",
          "Request deletion of Personal Data;",
          "Request grievance redressal;",
          "Nominate another individual to exercise applicable rights where permitted under law.",
        ],
        listSuffix: `Requests may be submitted through the Platform or by contacting HelpMeMan's designated Grievance Officer.`,
      },
      {
        id: "clause-32",
        number: 32,
        heading: "Children's Privacy",
        content: `Users below the age prescribed under applicable law must access the Platform only with verifiable consent from a parent or legal guardian. HelpMeMan reserves the right to request age verification or parental consent wherever required by law.`,
      },
      {
        id: "clause-33",
        number: 33,
        heading: "Data Breach Notification",
        content: `In the event of a Personal Data Breach affecting Users' rights or interests, HelpMeMan shall take appropriate remedial measures and notify affected Users and relevant authorities where required under applicable law.`,
      },
      {
        id: "clause-34",
        number: 34,
        heading: "Cross-Border Processing",
        content: `Where Personal Data is processed or stored outside India, HelpMeMan shall ensure that such processing is carried out in accordance with the Digital Personal Data Protection Act, 2023, and any other applicable laws governing international data transfers.`,
      },
    ],
  },
  {
    id: "part-4",
    title: "Part IV",
    subtitle:
      "Intellectual Property, Account Suspension, Liability, Dispute Resolution & General Provisions",
    clauses: [
      {
        id: "clause-35",
        number: 35,
        heading: "Intellectual Property Rights",
        content: `Unless otherwise expressly stated, all content made available on the Platform, including but not limited to: Software, Source Code, Website Design, Mobile Interface, Graphics, Logos, Icons, Text, Images, Videos, Audio, Databases, Mentor Listings, Ruth AI Features, QR Designs, Trademarks, Trade Dress, Platform Branding, and Algorithms are the exclusive property of HelpMeMan or its licensors and are protected under applicable intellectual property laws. No User shall reproduce, distribute, modify, reverse engineer, sell, lease, copy, publicly display, or commercially exploit any part of the Platform without prior written permission from HelpMeMan.`,
      },
      {
        id: "clause-36",
        number: 36,
        heading: "Mentor Content",
        content: `Mentors retain ownership of the original educational content, notes, presentations, study materials, and other intellectual property uploaded by them. By uploading such content, Mentors grant HelpMeMan a limited, non-exclusive, worldwide, royalty-free license to host, display, distribute, and make such content available solely for operating and promoting the Platform. Mentors warrant that they possess all necessary rights to upload such content and that it does not infringe upon the intellectual property rights of any third party.`,
      },
      {
        id: "clause-37",
        number: 37,
        heading: "User-Generated Content",
        content: `Users may upload reviews, feedback, profile information, messages, documents, or other content through the Platform. By submitting such content, Users grant HelpMeMan a non-exclusive, worldwide, royalty-free license to use, reproduce, store, display, and process such content for the operation, maintenance, moderation, and improvement of the Platform. Users remain solely responsible for the legality and accuracy of the content submitted by them.`,
      },
      {
        id: "clause-38",
        number: 38,
        heading: "Prohibited Activities",
        content: `Users shall not:`,
        list: [
          "Violate any applicable law or regulation;",
          "Impersonate another person or entity;",
          "Upload false, misleading, defamatory, or fraudulent information;",
          "Harass, threaten, abuse, or intimidate any User or Mentor;",
          "Share obscene, offensive, hateful, or illegal content;",
          "Attempt unauthorized access to Platform systems;",
          "Reverse engineer, scrape, or copy Platform data;",
          "Introduce malware, viruses, bots, or harmful code;",
          "Circumvent payment mechanisms or Platform security measures;",
          "Misuse Ruth AI or attempt to manipulate AI systems;",
          "Use the Platform for unlawful commercial purposes.",
        ],
        listSuffix: `HelpMeMan reserves the right to investigate and take appropriate action against any violation.`,
      },
      {
        id: "clause-39",
        number: 39,
        heading: "Reporting Misconduct",
        content: `Users may report inappropriate behaviour, fraud, impersonation, abusive conduct, or violations of these Terms through the "Report a Complaint" feature available on the Platform. HelpMeMan may investigate complaints and take appropriate action, including issuing warnings, suspending accounts, permanently terminating access, or reporting unlawful activities to the appropriate authorities. Submission of a complaint does not guarantee any specific outcome.`,
      },
      {
        id: "clause-40",
        number: 40,
        heading: "Suspension and Termination",
        content: `HelpMeMan reserves the right, at its sole discretion and without prior notice, to suspend, restrict, or permanently terminate any account where:`,
        list: [
          "These Terms are violated;",
          "Fraudulent or suspicious activity is detected;",
          "False information has been provided;",
          "Payments are disputed fraudulently;",
          "The Platform or other Users are placed at risk;",
          "Required by law or governmental authority.",
        ],
        listSuffix: `Termination of an account shall not affect any accrued legal rights or obligations.`,
      },
      {
        id: "clause-41",
        number: 41,
        heading: "Disclaimer of Warranties",
        content: `The Platform and all services are provided on an "as is" and "as available" basis. HelpMeMan makes no representation or warranty regarding:`,
        list: [
          "Continuous availability of the Platform;",
          "Accuracy of mentor advice;",
          "Accuracy of Ruth AI responses;",
          "Suitability of mentorship for any specific purpose;",
          "Error-free operation;",
          "Uninterrupted access;",
          "Freedom from viruses or harmful components.",
        ],
        listSuffix: `To the fullest extent permitted by law, all implied warranties are expressly disclaimed.`,
      },
      {
        id: "clause-42",
        number: 42,
        heading: "Limitation of Liability",
        content: `To the maximum extent permitted by applicable law, HelpMeMan, its founders, directors, officers, employees, affiliates, consultants, and partners shall not be liable for any:`,
        list: [
          "Indirect damages;",
          "Incidental damages;",
          "Consequential damages;",
          "Special damages;",
          "Loss of profits;",
          "Loss of opportunity;",
          "Loss of data;",
          "Business interruption;",
          "Reputation damage;",
          "Personal decisions made based on mentor advice or AI-generated responses.",
        ],
        listSuffix: `The total aggregate liability of HelpMeMan, if any, shall not exceed the amount actually paid by the User for the specific mentorship session giving rise to the claim.`,
      },
      {
        id: "clause-43",
        number: 43,
        heading: "Indemnification",
        content: `Users agree to indemnify, defend, and hold harmless HelpMeMan, its founders, directors, employees, affiliates, consultants, and licensors from and against any claims, losses, liabilities, damages, costs, expenses, or legal fees arising out of:`,
        list: [
          "Violation of these Terms;",
          "Misuse of the Platform;",
          "Infringement of third-party rights;",
          "Fraudulent conduct;",
          "Violation of applicable laws.",
        ],
      },
      {
        id: "clause-44",
        number: 44,
        heading: "Force Majeure",
        content: `HelpMeMan shall not be liable for any delay or failure in performance caused by events beyond its reasonable control, including but not limited to:`,
        list: [
          "Natural disasters;",
          "Floods;",
          "Earthquakes;",
          "Fire;",
          "Epidemics or pandemics;",
          "War;",
          "Terrorist acts;",
          "Government restrictions;",
          "Internet failures;",
          "Power outages;",
          "Cyberattacks;",
          "Failure of third-party service providers.",
        ],
      },
      {
        id: "clause-45",
        number: 45,
        heading: "Governing Law",
        content: `These Terms & Conditions shall be governed by and construed in accordance with the laws of the Republic of India.`,
      },
      {
        id: "clause-46",
        number: 46,
        heading: "Dispute Resolution",
        content: `Any dispute arising out of or relating to these Terms or the use of the Platform shall first be attempted to be resolved amicably through mutual discussions. If the dispute is not resolved within thirty (30) days, it shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Deoghar, Jharkhand, India, and the proceedings shall be conducted in the English language. Subject to arbitration, the courts having jurisdiction over the registered office of HelpMeMan shall have exclusive jurisdiction.`,
      },
      {
        id: "clause-47",
        number: 47,
        heading: "Amendments",
        content: `HelpMeMan reserves the right to amend, modify, or update these Terms at any time. Material changes shall be communicated through the Platform or by electronic communication where required. Continued use of the Platform after such changes constitutes acceptance of the revised Terms.`,
      },
      {
        id: "clause-48",
        number: 48,
        heading: "Severability",
        content: `If any provision of these Terms is held to be invalid, unlawful, or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain valid and enforceable.`,
      },
      {
        id: "clause-49",
        number: 49,
        heading: "Entire Agreement",
        content: `These Terms & Conditions, together with the Privacy Policy, Refund Policy, Cookie Policy, Community Guidelines, and any other policies published by HelpMeMan, constitute the entire agreement between the User and HelpMeMan regarding the use of the Platform.`,
      },
      {
        id: "clause-50",
        number: 50,
        heading: "Contact Information",
        content: `For any questions, grievances, complaints, or legal notices relating to these Terms, Users may contact HelpMeMan through the contact details published on the Platform. The designated Grievance Officer, if required under applicable law, shall address complaints within the timelines prescribed under the Digital Personal Data Protection Act, 2023 and other applicable laws.`,
      },
    ],
  },
];

export default function TermsPage() {
  const [activeClause, setActiveClause] = useState<string | null>(null);
  const lastUpdated = "July 23, 2025";

  const scrollToClause = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveClause(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      <style>{`
        .terms-toc-sidebar::-webkit-scrollbar { width: 3px; }
        .terms-toc-sidebar::-webkit-scrollbar-track { background: transparent; }
        .terms-toc-sidebar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 99px; }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 sm:px-10 py-4">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-zinc-900 flex items-center gap-2 select-none"
          >
            <img
              src="/logo.svg"
              alt="HelpMeMan Logo"
              className="w-7 h-7 object-contain"
            />
            <span>HelpMeMan</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 transition-all flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to home
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="pt-28 pb-12 px-6 sm:px-10 text-center relative overflow-hidden bg-zinc-50/50 border-b border-zinc-200">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,0,0,0.03) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-widest uppercase bg-zinc-100 border border-zinc-200 text-zinc-700">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Legal Agreement
          </div>
          <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-zinc-900 mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-zinc-600 mb-6">
            Please read these terms carefully before using the HelpMeMan Platform.
            By continuing to use our services, you agree to be legally bound by all provisions herein.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              Last Updated: {lastUpdated}
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Governed by Indian Law
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
              50 Clauses · 4 Parts
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 mx-auto w-full max-w-[1200px] px-4 sm:px-8 py-10">
        <div className="flex gap-8 lg:gap-12 items-start">

          {/* Sidebar ToC */}
          <aside className="terms-toc-sidebar hidden lg:block w-56 shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-zinc-400 mb-4">
              Contents
            </p>
            <nav className="flex flex-col gap-0.5">
              {parts.map((part) => (
                <div key={part.id} className="mb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5 px-2">
                    {part.title}
                  </div>
                  {part.clauses.map((clause) => (
                    <button
                      key={clause.id}
                      onClick={() => scrollToClause(clause.id)}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-all ${
                        activeClause === clause.id
                          ? "bg-zinc-900 text-white font-medium shadow-xs"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                      }`}
                    >
                      <span className="text-zinc-400 mr-1">
                        {clause.number}.
                      </span>
                      {clause.heading}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {parts.map((part, partIdx) => (
              <section key={part.id} id={part.id} className="mb-14">
                {/* Part header */}
                <div className="flex items-center gap-3 mb-8 pb-5 border-b border-zinc-200">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0 bg-zinc-900 text-white shadow-xs">
                    {partIdx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                      {part.title}
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                      {part.subtitle}
                    </h2>
                  </div>
                </div>

                {/* Clauses */}
                <div className="flex flex-col gap-5">
                  {part.clauses.map((clause) => (
                    <article
                      key={clause.id}
                      id={clause.id}
                      className="rounded-xl p-6 sm:p-7 bg-white border border-zinc-200/80 shadow-xs hover:shadow-sm hover:border-zinc-300 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold mt-0.5 bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {clause.number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-[17px] font-semibold text-zinc-900 mb-3">
                            {clause.heading}
                          </h3>

                          {clause.content && (
                            <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-600 mb-3 whitespace-pre-line">
                              {clause.content}
                            </p>
                          )}

                          {/* Simple list */}
                          {"list" in clause && clause.list && (
                            <ul className="mb-3 flex flex-col gap-1.5">
                              {(clause.list as string[]).map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2.5 text-sm sm:text-[15px] text-zinc-600"
                                >
                                  <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Sub-sections */}
                          {"subSections" in clause && clause.subSections && (
                            <div className="mb-3 flex flex-col gap-5">
                              {(clause.subSections as { title: string; items: string[] }[]).map(
                                (sub, si) => (
                                  <div key={si}>
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
                                      {sub.title}
                                    </p>
                                    <ul className="flex flex-col gap-1.5">
                                      {sub.items.map((item, ii) => (
                                        <li
                                          key={ii}
                                          className="flex items-start gap-2.5 text-sm text-zinc-600"
                                        >
                                          <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {/* List suffix */}
                          {"listSuffix" in clause && clause.listSuffix && (
                            <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-600">
                              {clause.listSuffix as string}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {/* Contact CTA */}
            <div className="rounded-2xl p-8 sm:p-10 mb-10 text-center bg-zinc-50 border border-zinc-200">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-white border border-zinc-200 shadow-xs text-zinc-800">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-zinc-900 mb-2">
                Questions about these Terms?
              </h3>
              <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
                For questions, grievances, complaints, or legal notices, reach out to us.
                Our Grievance Officer will respond within timelines prescribed under applicable law.
              </p>
              <a
                href="mailto:hello@helpmeman.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm transition-all"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                hello@helpmeman.com
              </a>
            </div>

            {/* Other policies quick links */}
            <div className="flex flex-wrap gap-3 mb-10 justify-center">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Refund & Cancellation", href: "/refund-policy" },
                { label: "Mentor Terms", href: "/mentor-terms" },
                { label: "Help & Guidelines", href: "/help" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}

---
layout: '@/templates/BaseProject.astro'
title: "Extend Merchant Portal"
description: "Extend's merchant dashboard to manage their product and shipping protection"
technologies: ["Typescript", "React", "Jest", "Cypress", "NodeJS/Express", "AWS Lambda", "DynamoDB", "Serverless", "AWS CDK"]
date: "Dec 2023"
imageSrc: "https://cdn.shopify.com/app-store/listing_images/cddb0851cd8b0c58d565d6466c66c3e0/promotional_image/CNCErKbm1PQCEAE=.png?height=720&width=1280"
---


### Project Overview
[The Extend Merchant Portal](https://docs.extend.com/docs/merchant-portal) is a browser-based application designed for merchants to manage their warranty programs. Initially a basic tool, the project's goal was to elevate its featureset and performance while modernizing an aging codebase. This included adding advanced features like contract and claim management, and enterprise functionalities such as Okta Login/SSO.

### Role: Staff Engineer / Engineering Manager
As a Staff Web Engineer, I established best practices and provided guidance, serving as a tech lead. Recognized for my extensive technical expertise and leadership abilities, I was promoted by senior management to the role of Engineering Manager. In this capacity, I prioritized team development and upheld the technical excellence of our projects.

### Technical Challenges and Solutions
The portal, initially developed by contractors and junior engineers, suffered from suboptimal practices. I addressed these by:
- Refactoring code to align with React best practices. `useEffect`s were overused and rampid throughout the application with business logic tightly defined inside components.
- An obsession to keep the codebase "DRY" led to overly complex components as engineers reached to build the one component for all the things. Myself and other senior engineers encouraged the KISS approach where we didn't try to guess the future, but witness patterns emerge to then capitalize on.  
- Our teams reach was big. While we were highly specialized in frontend development, we were also expected to contribute to our serverless architecture providing the myrid of micro-services that made up the larger platform.
- The application was also unnecessarily complex and tedious being built with RTK Toolkit and Redux Sagas. These tools are fine but our application didn't require global state and was introducing complexity without the benifit. Moving into [Jotai](https://jotai.org/) for state managment and React Query simplified our state managment and networking layer

### Management Challenges and Strategies
As a manager, I faced the challenge of leading a diverse team, including a wide range of high performing and underachieving engineers. My approach was:
- Personalized development plans to bridge skill gaps.
- Creating a collaborative and engaging environment
- Implementing team brown bags for peer learning and mentorship amongst the group.

### Team Dynamics and Development
I fostered team growth by:
- Recruiting high-performing engineers to set performance benchmarks.
- Encouraging mentorship within the team.
- Conducting interactive sessions like mock interviews and quizzes to identify and address weaknesses in a collaborative manner. This would fuel each engineers own development plan.

### Team Performance Metrics
Under my leadership, the team achieved:  
- Top 75th percentile in annual story points.  
- 85th percentile in sprint completion and 75th in predictability.  
- 92nd percentile in defect resolution and 78th percentile in PR engagement.

### Impact on Extend’s Business
The initiative markedly enhanced Extend's operational capabilities, especially for our enterprise clientele. It granted them enhanced oversight and management of their programs, satisfying their stringent security and integration stipulations. Although the allure of Extend's platform lies in the seamless management of insurance programs by a third party, our most substantial and revenue-generating customers desired greater autonomy over their programs and deeper integration with their existing systems of record.  

### Stakeholder Feedback
The project metrics reflect the positive impact and efficiency of the team. The enhancements in the portal were well-received by users, demonstrating the effectiveness of the team's efforts and the portal's improved functionality. While our primary focus was on delivering a better experience for our users, also established ourselves as thought leaders in frontend development for the larger company.

### Conclusion
My journey with the Extend Merchant Portal highlights a transition from a technical expert to a strategic leader. Balancing hands-on contributions with team management, I led the team to set a high standard in web application development and significantly improves Extend's merchant-facing operations.

/**
 * PeerPulse — Category-Based Skill Verification Quiz Bank
 * ─────────────────────────────────────────────────────────
 * Skills are grouped into 6 broad categories.
 * The user manually selects the category that best matches
 * their skill — there is no automatic mapping.
 *
 * Categories:
 *   1. Programming Fundamentals
 *   2. Web Development
 *   3. Database
 *   4. Object Oriented Programming
 *   5. Networking
 *   6. Software Engineering
 *
 * Each category has exactly 10 questions.
 * Each question has 4 options and 1 correct answer (zero-based index).
 * Answer keys are stored server-side ONLY — never sent to the frontend.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES LIST
// Exported so the frontend can render the category selection UI.
// The user picks one of these manually — no auto-mapping.
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { key: "programming_fundamentals",   label: "Programming Fundamentals",   icon: "💻" },
  { key: "web_development",            label: "Web Development",             icon: "🌐" },
  { key: "database",                   label: "Database",                    icon: "🗄️"  },
  { key: "object_oriented_programming",label: "Object Oriented Programming", icon: "🧩" },
  { key: "networking",                 label: "Networking",                  icon: "🔗" },
  { key: "software_engineering",       label: "Software Engineering",        icon: "⚙️"  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY QUESTION BANKS
// ─────────────────────────────────────────────────────────────────────────────
const categoryQuestions = {

  // ───────────────────────────────────────────
  // 1. PROGRAMMING FUNDAMENTALS
  //    Covers: variables, data types, control flow,
  //    functions, arrays, recursion, complexity, sorting
  // ───────────────────────────────────────────
  programming_fundamentals: {
    label: "Programming Fundamentals",
    questions: [
      {
        id: 1,
        question: "Which of the following best describes a variable in programming?",
        options: [
          "A fixed value that cannot be changed during execution",
          "A named storage location that holds a value which can change",
          "A function that returns a value",
          "A reserved keyword in all programming languages",
        ],
        answer: 1,
      },
      {
        id: 2,
        question: "What is the time complexity of accessing an element in an array by its index?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
        answer: 2,
      },
      {
        id: 3,
        question: "Which data structure follows the Last In, First Out (LIFO) principle?",
        options: ["Queue", "Stack", "Linked List", "Binary Tree"],
        answer: 1,
      },
      {
        id: 4,
        question: "What is recursion in programming?",
        options: [
          "A loop that runs a fixed number of times",
          "A function that calls itself until a base condition is met",
          "A method of sorting arrays in place",
          "A way to declare multiple variables at once",
        ],
        answer: 1,
      },
      {
        id: 5,
        question: "Which sorting algorithm has an average time complexity of O(n log n)?",
        options: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort"],
        answer: 3,
      },
      {
        id: 6,
        question: "What does a compiler do?",
        options: [
          "Executes code line by line at runtime",
          "Translates the entire source code into machine code before execution",
          "Manages memory allocation during program execution",
          "Connects the program to a database",
        ],
        answer: 1,
      },
      {
        id: 7,
        question: "Which of the following is an example of a primitive data type?",
        options: ["Array", "Object", "Integer", "Function"],
        answer: 2,
      },
      {
        id: 8,
        question: "What is the purpose of a loop in programming?",
        options: [
          "To define a new data type",
          "To repeat a block of code multiple times based on a condition",
          "To store multiple values in a single variable",
          "To call a function from another file",
        ],
        answer: 1,
      },
      {
        id: 9,
        question: "In a Binary Search Tree (BST), which property must always hold?",
        options: [
          "All nodes must have exactly two children",
          "The tree must be perfectly balanced",
          "Left child value < parent value < right child value",
          "All leaf nodes must be at the same depth",
        ],
        answer: 2,
      },
      {
        id: 10,
        question: "What does Big O notation describe?",
        options: [
          "The exact running time of an algorithm in seconds",
          "The amount of memory a program uses",
          "The upper bound of an algorithm's growth rate relative to input size",
          "The number of lines of code in a program",
        ],
        answer: 2,
      },
    ],
  },

  // ───────────────────────────────────────────
  // 2. WEB DEVELOPMENT
  //    Covers: HTML, CSS, JavaScript in browser,
  //    HTTP, REST, React concepts, Node.js basics
  // ───────────────────────────────────────────
  web_development: {
    label: "Web Development",
    questions: [
      {
        id: 1,
        question: "What does HTML stand for?",
        options: [
          "HyperText Markup Language",
          "High Transfer Markup Language",
          "HyperText Machine Language",
          "Hyperlink and Text Markup Language",
        ],
        answer: 0,
      },
      {
        id: 2,
        question: "Which CSS property is used to change the text color of an element?",
        options: ["font-color", "text-color", "color", "foreground"],
        answer: 2,
      },
      {
        id: 3,
        question: "What is the purpose of the HTTP GET method?",
        options: [
          "To submit form data to a server",
          "To delete a resource on the server",
          "To retrieve data from a server without modifying it",
          "To update an existing resource on the server",
        ],
        answer: 2,
      },
      {
        id: 4,
        question: "In a RESTful API, which HTTP status code indicates a resource was successfully created?",
        options: ["200 OK", "201 Created", "204 No Content", "400 Bad Request"],
        answer: 1,
      },
      {
        id: 5,
        question: "What is the role of the DOM (Document Object Model) in web development?",
        options: [
          "It manages server-side database connections",
          "It is a programming interface that represents the HTML document as a tree of objects",
          "It compiles JavaScript code before execution",
          "It handles HTTP requests between client and server",
        ],
        answer: 1,
      },
      {
        id: 6,
        question: "Which of the following correctly describes a React component?",
        options: [
          "A database table that stores UI data",
          "A reusable, independent piece of UI that can manage its own state",
          "A CSS class applied to HTML elements",
          "A server-side function that renders HTML",
        ],
        answer: 1,
      },
      {
        id: 7,
        question: "What does the CSS 'box model' consist of?",
        options: [
          "Color, font, border, and shadow",
          "Content, padding, border, and margin",
          "Width, height, position, and display",
          "Flexbox, grid, float, and position",
        ],
        answer: 1,
      },
      {
        id: 8,
        question: "What is the purpose of 'localStorage' in a web browser?",
        options: [
          "To store data on the server permanently",
          "To cache images and CSS files for faster loading",
          "To store key-value data on the client side with no expiration",
          "To manage session cookies across browser tabs",
        ],
        answer: 2,
      },
      {
        id: 9,
        question: "Which Node.js framework is most commonly used to build REST APIs?",
        options: ["Django", "Laravel", "Express.js", "Spring Boot"],
        answer: 2,
      },
      {
        id: 10,
        question: "What does CORS stand for and why is it important?",
        options: [
          "Client Origin Resource Sharing — controls how clients cache responses",
          "Cross-Origin Resource Sharing — controls which domains can access your API",
          "Cross-Origin Request Security — encrypts API responses",
          "Client-Only Rendering System — manages front-end rendering",
        ],
        answer: 1,
      },
    ],
  },

  // ───────────────────────────────────────────
  // 3. DATABASE
  //    Covers: SQL, NoSQL, normalization,
  //    indexes, transactions, MongoDB, keys
  // ───────────────────────────────────────────
  database: {
    label: "Database",
    questions: [
      {
        id: 1,
        question: "What is a primary key in a relational database?",
        options: [
          "A key that references a column in another table",
          "A column that uniquely identifies each row in a table",
          "An index created automatically on every column",
          "A constraint that allows duplicate values",
        ],
        answer: 1,
      },
      {
        id: 2,
        question: "What does SQL stand for?",
        options: [
          "Structured Query Language",
          "Simple Question Language",
          "Sequential Query Logic",
          "Standard Query Library",
        ],
        answer: 0,
      },
      {
        id: 3,
        question: "Which SQL clause is used to filter rows based on a condition?",
        options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"],
        answer: 2,
      },
      {
        id: 4,
        question: "What is database normalization?",
        options: [
          "The process of encrypting sensitive data in a database",
          "The process of organizing data to reduce redundancy and improve data integrity",
          "The process of backing up a database to a remote server",
          "The process of converting a NoSQL database to a relational one",
        ],
        answer: 1,
      },
      {
        id: 5,
        question: "What is the main difference between SQL and NoSQL databases?",
        options: [
          "SQL databases are faster than NoSQL databases in all cases",
          "SQL databases use structured tables with fixed schemas; NoSQL databases use flexible document or key-value models",
          "NoSQL databases only store images and files",
          "SQL databases cannot handle large amounts of data",
        ],
        answer: 1,
      },
      {
        id: 6,
        question: "What does the JOIN operation do in SQL?",
        options: [
          "Deletes matching rows from two tables",
          "Combines rows from two or more tables based on a related column",
          "Creates a new table from an existing one",
          "Sorts the result set in ascending order",
        ],
        answer: 1,
      },
      {
        id: 7,
        question: "What is an index in a database?",
        options: [
          "A backup copy of the entire database",
          "A constraint that prevents duplicate values",
          "A data structure that improves the speed of data retrieval operations",
          "A foreign key reference between two tables",
        ],
        answer: 2,
      },
      {
        id: 8,
        question: "In MongoDB, what is a collection equivalent to in a relational database?",
        options: ["A row", "A column", "A table", "A database"],
        answer: 2,
      },
      {
        id: 9,
        question: "What does ACID stand for in the context of database transactions?",
        options: [
          "Atomicity, Consistency, Isolation, Durability",
          "Accuracy, Concurrency, Integrity, Distribution",
          "Atomicity, Concurrency, Indexing, Durability",
          "Availability, Consistency, Isolation, Distribution",
        ],
        answer: 0,
      },
      {
        id: 10,
        question: "Which SQL command is used to retrieve all columns from a table named 'users'?",
        options: [
          "FETCH ALL FROM users",
          "GET * FROM users",
          "SELECT * FROM users",
          "SHOW ALL users",
        ],
        answer: 2,
      },
    ],
  },

  // ───────────────────────────────────────────
  // 4. OBJECT ORIENTED PROGRAMMING
  //    Covers: classes, objects, inheritance,
  //    polymorphism, encapsulation, abstraction,
  //    SOLID principles, design patterns
  // ───────────────────────────────────────────
  object_oriented_programming: {
    label: "Object Oriented Programming",
    questions: [
      {
        id: 1,
        question: "Which of the four pillars of OOP refers to hiding internal implementation details and exposing only necessary functionality?",
        options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
        answer: 2,
      },
      {
        id: 2,
        question: "What is inheritance in Object Oriented Programming?",
        options: [
          "The ability of a class to have multiple constructors",
          "A mechanism where a child class acquires properties and behaviors of a parent class",
          "The process of creating multiple objects from the same class",
          "A way to prevent a class from being instantiated",
        ],
        answer: 1,
      },
      {
        id: 3,
        question: "What is polymorphism in OOP?",
        options: [
          "The ability to define multiple classes in one file",
          "The ability of different classes to be treated as instances of the same parent class, each responding differently to the same method call",
          "The process of converting one data type to another",
          "A design pattern used to create singleton objects",
        ],
        answer: 1,
      },
      {
        id: 4,
        question: "What is an abstract class?",
        options: [
          "A class that can only contain static methods",
          "A class that cannot be instantiated and may contain abstract methods that subclasses must implement",
          "A class with no attributes, only methods",
          "A class that automatically inherits from all other classes",
        ],
        answer: 1,
      },
      {
        id: 5,
        question: "What does the 'S' in the SOLID principles stand for?",
        options: [
          "Substitution Principle",
          "Static Responsibility Principle",
          "Single Responsibility Principle",
          "Separation of Concerns Principle",
        ],
        answer: 2,
      },
      {
        id: 6,
        question: "What is the Singleton design pattern?",
        options: [
          "A pattern that creates a new object every time it is called",
          "A pattern that ensures a class has only one instance and provides a global access point to it",
          "A pattern used to separate the interface from its implementation",
          "A pattern that allows an object to change its behavior based on its state",
        ],
        answer: 1,
      },
      {
        id: 7,
        question: "What is method overriding in OOP?",
        options: [
          "Defining multiple methods with the same name but different parameters in the same class",
          "Preventing a method from being called outside the class",
          "Providing a new implementation of a method in a subclass that already exists in the parent class",
          "Calling a parent class method from a child class constructor",
        ],
        answer: 2,
      },
      {
        id: 8,
        question: "Which OOP concept allows a class to implement multiple interfaces?",
        options: [
          "Multiple inheritance through classes",
          "Encapsulation",
          "Interface implementation",
          "Method overloading",
        ],
        answer: 2,
      },
      {
        id: 9,
        question: "What is a constructor in OOP?",
        options: [
          "A method that destroys an object when it is no longer needed",
          "A special method that is automatically called when an object is created to initialize its attributes",
          "A static method that belongs to the class rather than any instance",
          "A method that converts an object to a string representation",
        ],
        answer: 1,
      },
      {
        id: 10,
        question: "What does the Liskov Substitution Principle (LSP) state?",
        options: [
          "A class should have only one reason to change",
          "Software entities should be open for extension but closed for modification",
          "Objects of a subclass should be replaceable with objects of the parent class without breaking the application",
          "Depend on abstractions, not on concrete implementations",
        ],
        answer: 2,
      },
    ],
  },

  // ───────────────────────────────────────────
  // 5. NETWORKING
  //    Covers: OSI model, TCP/IP, HTTP/HTTPS,
  //    DNS, IP addressing, protocols, security
  // ───────────────────────────────────────────
  networking: {
    label: "Networking",
    questions: [
      {
        id: 1,
        question: "How many layers does the OSI (Open Systems Interconnection) model have?",
        options: ["4", "5", "6", "7"],
        answer: 3,
      },
      {
        id: 2,
        question: "What is the primary role of the Transport Layer in the OSI model?",
        options: [
          "To define the physical transmission of data over cables",
          "To provide end-to-end communication and error recovery between hosts",
          "To handle IP addressing and routing of packets",
          "To manage the user interface and application protocols",
        ],
        answer: 1,
      },
      {
        id: 3,
        question: "What does DNS stand for and what is its function?",
        options: [
          "Data Network System — manages data packets across networks",
          "Domain Name System — translates human-readable domain names into IP addresses",
          "Dynamic Node Service — assigns dynamic IP addresses to devices",
          "Distributed Network Security — encrypts data in transit",
        ],
        answer: 1,
      },
      {
        id: 4,
        question: "What is the difference between TCP and UDP?",
        options: [
          "TCP is faster than UDP in all scenarios",
          "UDP provides guaranteed delivery; TCP does not",
          "TCP provides reliable, ordered delivery with error checking; UDP is faster but does not guarantee delivery",
          "TCP is used only for file transfers; UDP is used only for web browsing",
        ],
        answer: 2,
      },
      {
        id: 5,
        question: "What is an IP address?",
        options: [
          "A unique name assigned to a website",
          "A numerical label assigned to each device on a network used for identification and routing",
          "A password used to secure a network connection",
          "A protocol for transferring files between computers",
        ],
        answer: 1,
      },
      {
        id: 6,
        question: "What does HTTPS provide over HTTP?",
        options: [
          "Faster data transfer speeds",
          "The ability to load web pages offline",
          "Encrypted communication using SSL/TLS to protect data in transit",
          "Support for larger file uploads",
        ],
        answer: 2,
      },
      {
        id: 7,
        question: "What is the purpose of a firewall in a network?",
        options: [
          "To increase the speed of internet connections",
          "To monitor and control incoming and outgoing network traffic based on security rules",
          "To assign IP addresses to devices on a network",
          "To compress data before transmission",
        ],
        answer: 1,
      },
      {
        id: 8,
        question: "Which port number is used by HTTP by default?",
        options: ["21", "22", "80", "443"],
        answer: 2,
      },
      {
        id: 9,
        question: "What is a subnet mask used for?",
        options: [
          "To encrypt data packets before sending them",
          "To divide an IP address into network and host portions",
          "To assign a domain name to an IP address",
          "To block unauthorized access to a network",
        ],
        answer: 1,
      },
      {
        id: 10,
        question: "What does the term 'bandwidth' refer to in networking?",
        options: [
          "The physical length of a network cable",
          "The number of devices connected to a network",
          "The maximum rate of data transfer across a network connection",
          "The time it takes for a packet to travel from source to destination",
        ],
        answer: 2,
      },
    ],
  },

  // ───────────────────────────────────────────
  // 6. SOFTWARE ENGINEERING
  //    Covers: SDLC, Agile/Scrum, Git, testing,
  //    CI/CD, system design, requirements
  // ───────────────────────────────────────────
  software_engineering: {
    label: "Software Engineering",
    questions: [
      {
        id: 1,
        question: "What does SDLC stand for in software engineering?",
        options: [
          "Software Design and Logic Cycle",
          "System Development and Launch Checklist",
          "Software Development Life Cycle",
          "Structured Design and Language Compilation",
        ],
        answer: 2,
      },
      {
        id: 2,
        question: "Which Agile framework uses fixed-length iterations called Sprints?",
        options: ["Kanban", "Waterfall", "Scrum", "Extreme Programming (XP)"],
        answer: 2,
      },
      {
        id: 3,
        question: "What is the purpose of version control systems like Git?",
        options: [
          "To compile and run source code automatically",
          "To track changes in source code, enable collaboration, and allow reverting to previous versions",
          "To deploy applications to production servers",
          "To test code for bugs before it is written",
        ],
        answer: 1,
      },
      {
        id: 4,
        question: "What is a 'pull request' in the context of Git-based workflows?",
        options: [
          "A request to download the latest version of a repository",
          "A request to merge changes from one branch into another, typically reviewed by team members",
          "A command that removes the latest commit from a branch",
          "A notification sent when a build fails in CI/CD",
        ],
        answer: 1,
      },
      {
        id: 5,
        question: "What does unit testing involve?",
        options: [
          "Testing the entire application as a whole from the user's perspective",
          "Testing individual functions or components in isolation to verify they work correctly",
          "Testing the performance of the application under heavy load",
          "Testing the integration between the frontend and backend",
        ],
        answer: 1,
      },
      {
        id: 6,
        question: "What is Continuous Integration (CI) in software development?",
        options: [
          "A practice where developers manually merge code once a month",
          "A process where code changes are automatically built and tested every time they are pushed to a shared repository",
          "A deployment strategy that releases features to a small group of users first",
          "A method of writing requirements before any code is written",
        ],
        answer: 1,
      },
      {
        id: 7,
        question: "What is the main difference between functional and non-functional requirements?",
        options: [
          "Functional requirements describe what the system should do; non-functional requirements describe how well it should do it",
          "Functional requirements are written by developers; non-functional requirements are written by clients",
          "Functional requirements apply only to the backend; non-functional requirements apply to the frontend",
          "There is no difference — they are the same thing",
        ],
        answer: 0,
      },
      {
        id: 8,
        question: "What is the purpose of a code review?",
        options: [
          "To automatically fix bugs in the codebase",
          "To allow team members to examine each other's code for quality, correctness, and adherence to standards",
          "To generate documentation from source code comments",
          "To measure the performance of the application",
        ],
        answer: 1,
      },
      {
        id: 9,
        question: "Which software design principle states that a class should have only one reason to change?",
        options: [
          "Open/Closed Principle",
          "Dependency Inversion Principle",
          "Single Responsibility Principle",
          "Interface Segregation Principle",
        ],
        answer: 2,
      },
      {
        id: 10,
        question: "What is technical debt in software engineering?",
        options: [
          "The financial cost of purchasing software licenses",
          "The extra work created by choosing a quick, easy solution now instead of a better approach that would take longer",
          "The number of unresolved bugs in a codebase",
          "The time spent writing documentation for legacy systems",
        ],
        answer: 1,
      },
    ],
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the 10 quiz questions for a manually selected category key.
 * Answer keys are included (server-side only).
 * Strip the 'answer' field before sending to the frontend.
 *
 * @param {string} categoryKey - e.g. "web_development" (chosen by the user)
 * @returns {{ category: string, label: string, questions: Array }|null}
 */
export const getQuizForCategory = (categoryKey) => {
  if (!categoryKey) return null;
  const bank = categoryQuestions[categoryKey];
  if (!bank) return null;
  return {
    category: categoryKey,
    label: bank.label,
    questions: bank.questions,
  };
};

/**
 * Returns questions safe to send to the frontend (answer keys stripped).
 * Use this in your GET /api/verifications/questions?category=web_development endpoint.
 *
 * @param {string} categoryKey
 * @returns {{ category: string, label: string, questions: Array }|null}
 */
export const getSafeQuizForCategory = (categoryKey) => {
  const quiz = getQuizForCategory(categoryKey);
  if (!quiz) return null;
  return {
    category: quiz.category,
    label: quiz.label,
    questions: quiz.questions.map(({ id, question, options }) => ({
      id,
      question,
      options,
    })),
  };
};

/**
 * Auto-marks a submitted quiz against the answer key for a given category.
 * Returns per-question results, total score, and percentage.
 * Use this in your POST /api/verifications/submit endpoint.
 *
 * @param {string} categoryKey  - The category the user selected
 * @param {Array}  userAnswers  - [{ questionId: 1, selectedOption: 2 }, ...]
 * @returns {{ markedAnswers: Array, score: number, total: number, percentage: number }|null}
 */
export const markQuiz = (categoryKey, userAnswers) => {
  const quiz = getQuizForCategory(categoryKey);
  if (!quiz) return null;

  let score = 0;
  const markedAnswers = quiz.questions.map((q) => {
    const userAnswer    = userAnswers.find((a) => a.questionId === q.id);
    const selectedOption = userAnswer?.selectedOption ?? -1;
    const isCorrect      = selectedOption === q.answer;
    if (isCorrect) score++;
    return {
      questionId:      q.id,
      question:        q.question,
      selectedOption,
      correctOption:   q.answer,
      isCorrect,
    };
  });

  const total      = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);
  return { markedAnswers, score, total, percentage };
};

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC MODULE DEFINITIONS
// Predefined dropdown list shown to users when verifying an Academic Module.
// Each module has a code, title, and 5 MCQ questions.
// ─────────────────────────────────────────────────────────────────────────────
export const ACADEMIC_MODULES = [
  { code: 'IT3030', title: 'Programming Applications and Frameworks' },
  { code: 'IT3020', title: 'Database Systems'                        },
  { code: 'IT3010', title: 'Network Design and Management'           },
  { code: 'IT2070', title: 'Data Structures & Algorithms'            },
  { code: 'IT2010', title: 'Mobile Application Development'          },
  { code: 'IT2110', title: 'Probability & Statistics'                },
];

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC MODULE QUESTION BANKS
// 5 questions per module, 4 options each, 1 correct answer (zero-based index).
// Answer keys are server-side only — strip before sending to frontend.
// ─────────────────────────────────────────────────────────────────────────────
export const academicModuleQuestions = {

  // ── IT3030 — Programming Applications and Frameworks ──────────────────────
  IT3030: [
    {
      id: 1,
      question: "Which of the following best describes a software framework?",
      options: [
        "A programming language used to build web applications",
        "A reusable set of libraries and tools that provides a foundation for building applications",
        "A database management system for storing application data",
        "A version control system for managing source code",
      ],
      answer: 1,
    },
    {
      id: 2,
      question: "In the MVC (Model-View-Controller) pattern, what is the responsibility of the Controller?",
      options: [
        "To store and manage application data",
        "To render the user interface and display data",
        "To handle user input and coordinate between the Model and View",
        "To manage database connections and queries",
      ],
      answer: 2,
    },
    {
      id: 3,
      question: "What is the purpose of a REST API in a web application?",
      options: [
        "To style the frontend user interface using CSS rules",
        "To provide a standardized way for client and server to communicate over HTTP",
        "To compile server-side code into machine-readable bytecode",
        "To manage user sessions and authentication tokens on the client side",
      ],
      answer: 1,
    },
    {
      id: 4,
      question: "Which HTTP method is most appropriate for updating an existing resource in a RESTful API?",
      options: ["GET", "POST", "PUT", "DELETE"],
      answer: 2,
    },
    {
      id: 5,
      question: "What does the term 'dependency injection' mean in software frameworks?",
      options: [
        "Manually importing all required libraries at the top of each file",
        "A technique where a class receives its dependencies from an external source rather than creating them itself",
        "A method of injecting malicious code into a running application",
        "A process of automatically updating outdated framework versions",
      ],
      answer: 1,
    },
  ],

  // ── IT3020 — Database Systems ──────────────────────────────────────────────
  IT3020: [
    {
      id: 1,
      question: "What is the purpose of the third normal form (3NF) in database normalization?",
      options: [
        "To ensure every table has a primary key",
        "To eliminate transitive dependencies so non-key attributes depend only on the primary key",
        "To allow duplicate rows in a table for performance reasons",
        "To combine multiple tables into a single denormalized table",
      ],
      answer: 1,
    },
    {
      id: 2,
      question: "Which SQL statement is used to remove all rows from a table without deleting the table structure?",
      options: ["DROP TABLE", "DELETE FROM", "TRUNCATE TABLE", "REMOVE ALL"],
      answer: 2,
    },
    {
      id: 3,
      question: "What is a foreign key in a relational database?",
      options: [
        "A key used to encrypt sensitive data in a table",
        "A column that uniquely identifies each row in its own table",
        "A column that references the primary key of another table to establish a relationship",
        "An automatically generated key assigned by the database engine",
      ],
      answer: 2,
    },
    {
      id: 4,
      question: "In a database transaction, what does the ROLLBACK command do?",
      options: [
        "Permanently saves all changes made during the transaction",
        "Undoes all changes made during the current transaction and restores the previous state",
        "Deletes the entire database and recreates it from a backup",
        "Locks the database table to prevent concurrent access",
      ],
      answer: 1,
    },
    {
      id: 5,
      question: "Which type of JOIN returns only the rows that have matching values in both tables?",
      options: ["LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "INNER JOIN"],
      answer: 3,
    },
  ],

  // ── IT3010 — Network Design and Management ─────────────────────────────────
  IT3010: [
    {
      id: 1,
      question: "What is the primary purpose of the Network Layer (Layer 3) in the OSI model?",
      options: [
        "To establish physical connections between devices",
        "To provide logical addressing and routing of packets between networks",
        "To manage end-to-end data delivery and error correction",
        "To define the format and encoding of data for transmission",
      ],
      answer: 1,
    },
    {
      id: 2,
      question: "What does VLAN stand for and what is its main benefit?",
      options: [
        "Virtual Local Area Network — logically segments a physical network to improve security and performance",
        "Variable Length Address Network — allows dynamic IP address assignment",
        "Verified LAN Access Node — authenticates devices before granting network access",
        "Virtual Link Aggregation Node — combines multiple network links for redundancy",
      ],
      answer: 0,
    },
    {
      id: 3,
      question: "Which routing protocol is classified as a link-state protocol?",
      options: ["RIP (Routing Information Protocol)", "OSPF (Open Shortest Path First)", "BGP (Border Gateway Protocol)", "EIGRP (Enhanced Interior Gateway Routing Protocol)"],
      answer: 1,
    },
    {
      id: 4,
      question: "What is the function of DHCP in a network?",
      options: [
        "To translate domain names into IP addresses",
        "To encrypt data transmitted between network devices",
        "To automatically assign IP addresses and network configuration to devices",
        "To monitor and log all network traffic for security analysis",
      ],
      answer: 2,
    },
    {
      id: 5,
      question: "In network design, what does the term 'redundancy' refer to?",
      options: [
        "Using the same IP address for multiple devices to save address space",
        "Duplicating critical network components or paths so the network continues to function if one fails",
        "Compressing network traffic to reduce bandwidth usage",
        "Restricting network access to authorized users only",
      ],
      answer: 1,
    },
  ],

  // ── IT2070 — Data Structures & Algorithms ─────────────────────────────────
  IT2070: [
    {
      id: 1,
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
      answer: 2,
    },
    {
      id: 2,
      question: "Which data structure is most suitable for implementing a priority queue?",
      options: ["Stack", "Linked List", "Heap", "Hash Table"],
      answer: 2,
    },
    {
      id: 3,
      question: "In graph traversal, what is the key difference between BFS and DFS?",
      options: [
        "BFS uses a stack; DFS uses a queue",
        "BFS explores all neighbors at the current depth before moving deeper; DFS explores as far as possible along each branch before backtracking",
        "BFS only works on directed graphs; DFS only works on undirected graphs",
        "BFS finds the shortest path in weighted graphs; DFS finds the longest path",
      ],
      answer: 1,
    },
    {
      id: 4,
      question: "What is the space complexity of a recursive algorithm that makes n recursive calls with no additional data structures?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: 2,
    },
    {
      id: 5,
      question: "Which of the following operations has O(1) average time complexity in a Hash Table?",
      options: ["Searching for an element", "Sorting all elements", "Finding the minimum element", "Traversing all elements"],
      answer: 0,
    },
  ],

  // ── IT2010 — Mobile Application Development ───────────────────────────────
  IT2010: [
    {
      id: 1,
      question: "What is the main difference between a native mobile app and a hybrid mobile app?",
      options: [
        "Native apps run in a web browser; hybrid apps are installed on the device",
        "Native apps are built for a specific platform using its native language; hybrid apps use web technologies wrapped in a native container",
        "Native apps are free to develop; hybrid apps require a paid license",
        "Native apps only work offline; hybrid apps require a constant internet connection",
      ],
      answer: 1,
    },
    {
      id: 2,
      question: "In Android development, what is the purpose of an Activity?",
      options: [
        "A background service that runs without a user interface",
        "A single screen with a user interface that the user can interact with",
        "A database helper class for managing SQLite operations",
        "A configuration file that defines app permissions and metadata",
      ],
      answer: 1,
    },
    {
      id: 3,
      question: "What does the term 'responsive design' mean in mobile app development?",
      options: [
        "The app responds quickly to user input with no lag",
        "The app layout adapts to different screen sizes and orientations",
        "The app sends push notifications in response to server events",
        "The app uses animations to respond to touch gestures",
      ],
      answer: 1,
    },
    {
      id: 4,
      question: "Which file in an Android project defines the app's permissions, components, and metadata?",
      options: ["build.gradle", "MainActivity.java", "AndroidManifest.xml", "strings.xml"],
      answer: 2,
    },
    {
      id: 5,
      question: "What is the purpose of an API in mobile application development?",
      options: [
        "To design the visual layout of the mobile app screens",
        "To allow the mobile app to communicate with a backend server and exchange data",
        "To compile the mobile app source code into an installable package",
        "To manage the app's local storage and file system access",
      ],
      answer: 1,
    },
  ],

  // ── IT2110 — Probability & Statistics ─────────────────────────────────────
  IT2110: [
    {
      id: 1,
      question: "What does the expected value (mean) of a random variable represent?",
      options: [
        "The most frequently occurring value in a dataset",
        "The middle value when all values are sorted in order",
        "The long-run average value of the variable over many repetitions of an experiment",
        "The difference between the maximum and minimum values in a dataset",
      ],
      answer: 2,
    },
    {
      id: 2,
      question: "If two events A and B are independent, which of the following is true?",
      options: [
        "P(A and B) = P(A) + P(B)",
        "P(A and B) = P(A) × P(B)",
        "P(A and B) = P(A) - P(B)",
        "P(A and B) = P(A) / P(B)",
      ],
      answer: 1,
    },
    {
      id: 3,
      question: "What does standard deviation measure in a dataset?",
      options: [
        "The average of all values in the dataset",
        "The total number of values in the dataset",
        "The spread or dispersion of values around the mean",
        "The probability of a specific value occurring",
      ],
      answer: 2,
    },
    {
      id: 4,
      question: "In a normal distribution, approximately what percentage of data falls within one standard deviation of the mean?",
      options: ["50%", "68%", "95%", "99.7%"],
      answer: 1,
    },
    {
      id: 5,
      question: "What is the difference between descriptive and inferential statistics?",
      options: [
        "Descriptive statistics uses graphs; inferential statistics uses tables",
        "Descriptive statistics summarizes data from a sample; inferential statistics makes predictions about a population based on sample data",
        "Descriptive statistics applies to large datasets; inferential statistics applies to small datasets only",
        "There is no difference — they are the same branch of statistics",
      ],
      answer: 1,
    },
  ],
};

export default categoryQuestions;

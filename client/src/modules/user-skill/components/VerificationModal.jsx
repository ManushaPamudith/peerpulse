import { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY LABELS — maps categoryKey → display label
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  programming_fundamentals:    'Programming Fundamentals',
  web_development:             'Web Development',
  database:                    'Database',
  object_oriented_programming: 'Object Oriented Programming',
  networking:                  'Networking',
  software_engineering:        'Software Engineering',
};

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC MODULE LABELS — maps moduleCode → title
// ─────────────────────────────────────────────────────────────────────────────
const MODULE_LABELS = {
  IT3030: 'Programming Applications and Frameworks',
  IT3020: 'Database Systems',
  IT3010: 'Network Design and Management',
  IT2070: 'Data Structures & Algorithms',
  IT2010: 'Mobile Application Development',
  IT2110: 'Probability & Statistics',
};

// ─────────────────────────────────────────────────────────────────────────────
// TECHNICAL QUESTION BANKS — 10 questions per category
// ─────────────────────────────────────────────────────────────────────────────
const TECH_BANKS = {
  programming_fundamentals: [
    { id:1,  question:'Which of the following best describes a variable in programming?', options:['A fixed value that cannot be changed','A named storage location that holds a changeable value','A function that returns a value','A reserved keyword in all languages'], answer:1 },
    { id:2,  question:'What is the time complexity of accessing an element in an array by index?', options:['O(n)','O(log n)','O(1)','O(n²)'], answer:2 },
    { id:3,  question:'Which data structure follows the Last In, First Out (LIFO) principle?', options:['Queue','Stack','Linked List','Binary Tree'], answer:1 },
    { id:4,  question:'What is recursion in programming?', options:['A loop that runs a fixed number of times','A function that calls itself until a base condition is met','A method of sorting arrays in place','A way to declare multiple variables at once'], answer:1 },
    { id:5,  question:'Which sorting algorithm has an average time complexity of O(n log n)?', options:['Bubble Sort','Selection Sort','Insertion Sort','Merge Sort'], answer:3 },
    { id:6,  question:'What does a compiler do?', options:['Executes code line by line at runtime','Translates entire source code into machine code before execution','Manages memory allocation during execution','Connects the program to a database'], answer:1 },
    { id:7,  question:'Which of the following is an example of a primitive data type?', options:['Array','Object','Integer','Function'], answer:2 },
    { id:8,  question:'What is the purpose of a loop in programming?', options:['To define a new data type','To repeat a block of code based on a condition','To store multiple values in one variable','To call a function from another file'], answer:1 },
    { id:9,  question:'In a Binary Search Tree (BST), which property must always hold?', options:['All nodes must have exactly two children','The tree must be perfectly balanced','Left child < parent < right child','All leaf nodes must be at the same depth'], answer:2 },
    { id:10, question:'What does Big O notation describe?', options:['The exact running time in seconds','The amount of memory a program uses','The upper bound of an algorithm growth rate relative to input size','The number of lines of code'], answer:2 },
  ],
  web_development: [
    { id:1,  question:'What does HTML stand for?', options:['HyperText Markup Language','High Transfer Markup Language','HyperText Machine Language','Hyperlink and Text Markup Language'], answer:0 },
    { id:2,  question:'Which CSS property changes the text color of an element?', options:['font-color','text-color','color','foreground'], answer:2 },
    { id:3,  question:'What is the purpose of the HTTP GET method?', options:['To submit form data to a server','To delete a resource on the server','To retrieve data without modifying it','To update an existing resource'], answer:2 },
    { id:4,  question:'Which HTTP status code indicates a resource was successfully created?', options:['200 OK','201 Created','204 No Content','400 Bad Request'], answer:1 },
    { id:5,  question:'What is the role of the DOM in web development?', options:['It manages server-side database connections','It represents the HTML document as a tree of objects','It compiles JavaScript before execution','It handles HTTP requests'], answer:1 },
    { id:6,  question:'Which of the following correctly describes a React component?', options:['A database table that stores UI data','A reusable, independent piece of UI that can manage its own state','A CSS class applied to HTML elements','A server-side function that renders HTML'], answer:1 },
    { id:7,  question:'What does the CSS box model consist of?', options:['Color, font, border, shadow','Content, padding, border, margin','Width, height, position, display','Flexbox, grid, float, position'], answer:1 },
    { id:8,  question:'What is the purpose of localStorage in a web browser?', options:['To store data on the server permanently','To cache images and CSS files','To store key-value data on the client side with no expiration','To manage session cookies across tabs'], answer:2 },
    { id:9,  question:'Which Node.js framework is most commonly used to build REST APIs?', options:['Django','Laravel','Express.js','Spring Boot'], answer:2 },
    { id:10, question:'What does CORS stand for?', options:['Client Origin Resource Sharing','Cross-Origin Resource Sharing','Cross-Origin Request Security','Client-Only Rendering System'], answer:1 },
  ],
  database: [
    { id:1,  question:'What is a primary key in a relational database?', options:['A key that references another table','A column that uniquely identifies each row','An index on every column','A constraint that allows duplicates'], answer:1 },
    { id:2,  question:'What does SQL stand for?', options:['Structured Query Language','Simple Question Language','Sequential Query Logic','Standard Query Library'], answer:0 },
    { id:3,  question:'Which SQL clause filters rows based on a condition?', options:['ORDER BY','GROUP BY','WHERE','HAVING'], answer:2 },
    { id:4,  question:'What is database normalization?', options:['Encrypting sensitive data','Organizing data to reduce redundancy and improve integrity','Backing up a database remotely','Converting NoSQL to relational'], answer:1 },
    { id:5,  question:'What is the main difference between SQL and NoSQL databases?', options:['SQL is always faster','SQL uses structured tables with fixed schemas; NoSQL uses flexible models','NoSQL only stores images','SQL cannot handle large data'], answer:1 },
    { id:6,  question:'What does the JOIN operation do in SQL?', options:['Deletes matching rows from two tables','Combines rows from two or more tables based on a related column','Creates a new table from an existing one','Sorts the result set'], answer:1 },
    { id:7,  question:'What is an index in a database?', options:['A backup copy of the database','A constraint preventing duplicates','A data structure that improves query speed','A foreign key reference'], answer:2 },
    { id:8,  question:'In MongoDB, what is a collection equivalent to in a relational database?', options:['A row','A column','A table','A database'], answer:2 },
    { id:9,  question:'What does ACID stand for in database transactions?', options:['Atomicity, Consistency, Isolation, Durability','Accuracy, Concurrency, Integrity, Distribution','Atomicity, Concurrency, Indexing, Durability','Availability, Consistency, Isolation, Distribution'], answer:0 },
    { id:10, question:'Which SQL command retrieves all columns from a table named users?', options:['FETCH ALL FROM users','GET * FROM users','SELECT * FROM users','SHOW ALL users'], answer:2 },
  ],
  object_oriented_programming: [
    { id:1,  question:'Which OOP pillar refers to hiding internal details and exposing only necessary functionality?', options:['Inheritance','Polymorphism','Encapsulation','Abstraction'], answer:2 },
    { id:2,  question:'What is inheritance in OOP?', options:['A class having multiple constructors','A child class acquiring properties and behaviors of a parent class','Creating multiple objects from the same class','Preventing a class from being instantiated'], answer:1 },
    { id:3,  question:'What is polymorphism in OOP?', options:['Defining multiple classes in one file','Different classes responding differently to the same method call','Converting one data type to another','A pattern to create singleton objects'], answer:1 },
    { id:4,  question:'What is an abstract class?', options:['A class with only static methods','A class that cannot be instantiated and may contain abstract methods','A class with no attributes','A class that inherits from all others'], answer:1 },
    { id:5,  question:'What does the S in SOLID principles stand for?', options:['Substitution Principle','Static Responsibility Principle','Single Responsibility Principle','Separation of Concerns'], answer:2 },
    { id:6,  question:'What is the Singleton design pattern?', options:['Creates a new object every time','Ensures a class has only one instance with a global access point','Separates interface from implementation','Allows an object to change behavior based on state'], answer:1 },
    { id:7,  question:'What is method overriding in OOP?', options:['Same method name with different parameters in the same class','Preventing a method from being called outside the class','Providing a new implementation of a parent method in a subclass','Calling a parent constructor from a child class'], answer:2 },
    { id:8,  question:'Which OOP concept allows a class to implement multiple interfaces?', options:['Multiple class inheritance','Encapsulation','Interface implementation','Method overloading'], answer:2 },
    { id:9,  question:'What is a constructor in OOP?', options:['A method that destroys an object','A special method called when an object is created to initialize attributes','A static method belonging to the class','A method that converts an object to string'], answer:1 },
    { id:10, question:'What does the Liskov Substitution Principle state?', options:['A class should have only one reason to change','Entities should be open for extension but closed for modification','Subclass objects should be replaceable with parent class objects without breaking the app','Depend on abstractions, not concrete implementations'], answer:2 },
  ],
  networking: [
    { id:1,  question:'How many layers does the OSI model have?', options:['4','5','6','7'], answer:3 },
    { id:2,  question:'What is the primary role of the Transport Layer in the OSI model?', options:['Define physical transmission over cables','Provide end-to-end communication and error recovery','Handle IP addressing and routing','Manage user interface and application protocols'], answer:1 },
    { id:3,  question:'What does DNS stand for and what does it do?', options:['Data Network System — manages packets','Domain Name System — translates domain names to IP addresses','Dynamic Node Service — assigns dynamic IPs','Distributed Network Security — encrypts data'], answer:1 },
    { id:4,  question:'What is the difference between TCP and UDP?', options:['TCP is faster in all scenarios','UDP provides guaranteed delivery; TCP does not','TCP provides reliable ordered delivery; UDP is faster but does not guarantee delivery','TCP is only for files; UDP is only for web browsing'], answer:2 },
    { id:5,  question:'What is an IP address?', options:['A unique name assigned to a website','A numerical label assigned to each device for identification and routing','A password to secure a connection','A protocol for transferring files'], answer:1 },
    { id:6,  question:'What does HTTPS provide over HTTP?', options:['Faster transfer speeds','Ability to load pages offline','Encrypted communication using SSL/TLS','Support for larger file uploads'], answer:2 },
    { id:7,  question:'What is the purpose of a firewall?', options:['Increase internet speed','Monitor and control network traffic based on security rules','Assign IP addresses to devices','Compress data before transmission'], answer:1 },
    { id:8,  question:'Which port number does HTTP use by default?', options:['21','22','80','443'], answer:2 },
    { id:9,  question:'What is a subnet mask used for?', options:['To encrypt data packets','To divide an IP address into network and host portions','To assign a domain name to an IP','To block unauthorized access'], answer:1 },
    { id:10, question:'What does bandwidth refer to in networking?', options:['The physical length of a cable','The number of devices on a network','The maximum rate of data transfer across a connection','The time for a packet to travel from source to destination'], answer:2 },
  ],
  software_engineering: [
    { id:1,  question:'What does SDLC stand for?', options:['Software Design and Logic Cycle','System Development and Launch Checklist','Software Development Life Cycle','Structured Design and Language Compilation'], answer:2 },
    { id:2,  question:'Which Agile framework uses fixed-length iterations called Sprints?', options:['Kanban','Waterfall','Scrum','Extreme Programming (XP)'], answer:2 },
    { id:3,  question:'What is the purpose of version control systems like Git?', options:['To compile and run source code automatically','To track changes, enable collaboration, and allow reverting to previous versions','To deploy applications to production','To test code for bugs before it is written'], answer:1 },
    { id:4,  question:'What is a pull request in Git-based workflows?', options:['A request to download the latest repository version','A request to merge changes from one branch into another, reviewed by team members','A command that removes the latest commit','A notification when a build fails'], answer:1 },
    { id:5,  question:'What does unit testing involve?', options:['Testing the entire application from the perspective of the user','Testing individual functions in isolation to verify they work correctly','Testing performance under heavy load','Testing integration between frontend and backend'], answer:1 },
    { id:6,  question:'What is Continuous Integration (CI)?', options:['Developers manually merge code once a month','Code changes are automatically built and tested every time they are pushed','A deployment strategy releasing features to a small group first','Writing requirements before any code is written'], answer:1 },
    { id:7,  question:'What is the main difference between functional and non-functional requirements?', options:['Functional describes what the system does; non-functional describes how well it does it','Functional is written by developers; non-functional by clients','Functional applies to backend; non-functional to frontend','There is no difference'], answer:0 },
    { id:8,  question:'What is the purpose of a code review?', options:['To automatically fix bugs','To examine code for quality, correctness, and adherence to standards','To generate documentation from comments','To measure application performance'], answer:1 },
    { id:9,  question:'Which principle states a class should have only one reason to change?', options:['Open/Closed Principle','Dependency Inversion Principle','Single Responsibility Principle','Interface Segregation Principle'], answer:2 },
    { id:10, question:'What is technical debt in software engineering?', options:['The financial cost of software licenses','Extra work created by choosing a quick solution instead of a better long-term approach','The number of unresolved bugs','Time spent writing documentation for legacy systems'], answer:1 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC QUESTION BANKS — 5 questions per module
// ─────────────────────────────────────────────────────────────────────────────
const ACADEMIC_BANKS = {
  IT3030: [
    { id:1, question:'Which of the following best describes a software framework?', options:['A programming language used to build web applications','A reusable set of libraries and tools that provides a foundation for building applications','A database management system for storing application data','A version control system for managing source code'], answer:1 },
    { id:2, question:'In the MVC pattern, what is the responsibility of the Controller?', options:['To store and manage application data','To render the user interface and display data','To handle user input and coordinate between the Model and View','To manage database connections and queries'], answer:2 },
    { id:3, question:'What is the purpose of a REST API in a web application?', options:['To style the frontend user interface using CSS rules','To provide a standardized way for client and server to communicate over HTTP','To compile server-side code into machine-readable bytecode','To manage user sessions and authentication tokens on the client side'], answer:1 },
    { id:4, question:'Which HTTP method is most appropriate for updating an existing resource in a RESTful API?', options:['GET','POST','PUT','DELETE'], answer:2 },
    { id:5, question:'What does dependency injection mean in software frameworks?', options:['Manually importing all required libraries at the top of each file','A technique where a class receives its dependencies from an external source rather than creating them itself','A method of injecting malicious code into a running application','A process of automatically updating outdated framework versions'], answer:1 },
  ],
  IT3020: [
    { id:1, question:'What is the purpose of the third normal form (3NF) in database normalization?', options:['To ensure every table has a primary key','To eliminate transitive dependencies so non-key attributes depend only on the primary key','To allow duplicate rows in a table for performance reasons','To combine multiple tables into a single denormalized table'], answer:1 },
    { id:2, question:'Which SQL statement removes all rows from a table without deleting the table structure?', options:['DROP TABLE','DELETE FROM','TRUNCATE TABLE','REMOVE ALL'], answer:2 },
    { id:3, question:'What is a foreign key in a relational database?', options:['A key used to encrypt sensitive data','A column that uniquely identifies each row in its own table','A column that references the primary key of another table to establish a relationship','An automatically generated key assigned by the database engine'], answer:2 },
    { id:4, question:'In a database transaction, what does the ROLLBACK command do?', options:['Permanently saves all changes made during the transaction','Undoes all changes made during the current transaction and restores the previous state','Deletes the entire database and recreates it from a backup','Locks the database table to prevent concurrent access'], answer:1 },
    { id:5, question:'Which type of JOIN returns only the rows that have matching values in both tables?', options:['LEFT JOIN','RIGHT JOIN','FULL OUTER JOIN','INNER JOIN'], answer:3 },
  ],
  IT3010: [
    { id:1, question:'What is the primary purpose of the Network Layer (Layer 3) in the OSI model?', options:['To establish physical connections between devices','To provide logical addressing and routing of packets between networks','To manage end-to-end data delivery and error correction','To define the format and encoding of data for transmission'], answer:1 },
    { id:2, question:'What does VLAN stand for and what is its main benefit?', options:['Virtual Local Area Network — logically segments a physical network to improve security and performance','Variable Length Address Network — allows dynamic IP address assignment','Verified LAN Access Node — authenticates devices before granting network access','Virtual Link Aggregation Node — combines multiple network links for redundancy'], answer:0 },
    { id:3, question:'Which routing protocol is classified as a link-state protocol?', options:['RIP (Routing Information Protocol)','OSPF (Open Shortest Path First)','BGP (Border Gateway Protocol)','EIGRP (Enhanced Interior Gateway Routing Protocol)'], answer:1 },
    { id:4, question:'What is the function of DHCP in a network?', options:['To translate domain names into IP addresses','To encrypt data transmitted between network devices','To automatically assign IP addresses and network configuration to devices','To monitor and log all network traffic for security analysis'], answer:2 },
    { id:5, question:'In network design, what does the term redundancy refer to?', options:['Using the same IP address for multiple devices to save address space','Duplicating critical network components or paths so the network continues to function if one fails','Compressing network traffic to reduce bandwidth usage','Restricting network access to authorized users only'], answer:1 },
  ],
  IT2070: [
    { id:1, question:'What is the worst-case time complexity of QuickSort?', options:['O(n log n)','O(n)','O(n²)','O(log n)'], answer:2 },
    { id:2, question:'Which data structure is most suitable for implementing a priority queue?', options:['Stack','Linked List','Heap','Hash Table'], answer:2 },
    { id:3, question:'What is the key difference between BFS and DFS in graph traversal?', options:['BFS uses a stack; DFS uses a queue','BFS explores all neighbors at the current depth before moving deeper; DFS explores as far as possible along each branch before backtracking','BFS only works on directed graphs; DFS only works on undirected graphs','BFS finds the shortest path in weighted graphs; DFS finds the longest path'], answer:1 },
    { id:4, question:'What is the space complexity of a recursive algorithm that makes n recursive calls with no additional data structures?', options:['O(1)','O(log n)','O(n)','O(n²)'], answer:2 },
    { id:5, question:'Which operation has O(1) average time complexity in a Hash Table?', options:['Searching for an element','Sorting all elements','Finding the minimum element','Traversing all elements'], answer:0 },
  ],
  IT2010: [
    { id:1, question:'What is the main difference between a native mobile app and a hybrid mobile app?', options:['Native apps run in a web browser; hybrid apps are installed on the device','Native apps are built for a specific platform using its native language; hybrid apps use web technologies wrapped in a native container','Native apps are free to develop; hybrid apps require a paid license','Native apps only work offline; hybrid apps require a constant internet connection'], answer:1 },
    { id:2, question:'In Android development, what is the purpose of an Activity?', options:['A background service that runs without a user interface','A single screen with a user interface that the user can interact with','A database helper class for managing SQLite operations','A configuration file that defines app permissions and metadata'], answer:1 },
    { id:3, question:'What does responsive design mean in mobile app development?', options:['The app responds quickly to user input with no lag','The app layout adapts to different screen sizes and orientations','The app sends push notifications in response to server events','The app uses animations to respond to touch gestures'], answer:1 },
    { id:4, question:"Which file in an Android project defines the app's permissions, components, and metadata?", options:['build.gradle','MainActivity.java','AndroidManifest.xml','strings.xml'], answer:2 },
    { id:5, question:'What is the purpose of an API in mobile application development?', options:['To design the visual layout of the mobile app screens','To allow the mobile app to communicate with a backend server and exchange data','To compile the mobile app source code into an installable package','To manage the app local storage and file system access'], answer:1 },
  ],
  IT2110: [
    { id:1, question:'What does the expected value (mean) of a random variable represent?', options:['The most frequently occurring value in a dataset','The middle value when all values are sorted in order','The long-run average value of the variable over many repetitions of an experiment','The difference between the maximum and minimum values in a dataset'], answer:2 },
    { id:2, question:'If two events A and B are independent, which of the following is true?', options:['P(A and B) = P(A) + P(B)','P(A and B) = P(A) x P(B)','P(A and B) = P(A) - P(B)','P(A and B) = P(A) / P(B)'], answer:1 },
    { id:3, question:'What does standard deviation measure in a dataset?', options:['The average of all values in the dataset','The total number of values in the dataset','The spread or dispersion of values around the mean','The probability of a specific value occurring'], answer:2 },
    { id:4, question:'In a normal distribution, approximately what percentage of data falls within one standard deviation of the mean?', options:['50%','68%','95%','99.7%'], answer:1 },
    { id:5, question:'What is the difference between descriptive and inferential statistics?', options:['Descriptive statistics uses graphs; inferential statistics uses tables','Descriptive statistics summarizes data from a sample; inferential statistics makes predictions about a population based on sample data','Descriptive statistics applies to large datasets; inferential statistics applies to small datasets only','There is no difference'], answer:1 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-0 mb-5">
      {steps.map((label, i) => {
        const idx = i + 1; const done = idx < current; const active = idx === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {done ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : idx}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? 'text-indigo-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function InfoPill({ icon, label, value, color = 'indigo' }) {
  const cls = { indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100', violet: 'bg-violet-50 text-violet-700 border-violet-100', emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${cls[color]}`}>
      <span>{icon}</span><span className="text-slate-400 font-normal">{label}:</span><span className="truncate max-w-[140px]">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MODAL
//
// Props:
//   skill    — full skill object from user profile:
//              { _id, skill, level, type, categoryKey, moduleCode, ... }
//   onClose  — close handler
//   onSubmit — called with result payload on final submission
//
// The modal NO LONGER asks the user to select a category or module.
// Those were already chosen when the skill was added.
// ─────────────────────────────────────────────────────────────────────────────
export default function VerificationModal({ skill, onClose, onSubmit }) {
  const isTech    = skill.type === 'Technical Skill';
  const fileRef   = useRef();

  // Resolve questions from the saved categoryKey / moduleCode
  const questions = isTech
    ? (TECH_BANKS[skill.categoryKey] || [])
    : (ACADEMIC_BANKS[skill.moduleCode] || []);

  const categoryLabel = CATEGORY_LABELS[skill.categoryKey] || skill.categoryKey || '—';
  const moduleTitle   = MODULE_LABELS[skill.moduleCode]    || skill.moduleCode   || '—';

  // ── state ──
  const [step,       setStep]       = useState('quiz');   // quiz | upload (academic) | result
  const [answers,    setAnswers]    = useState({});
  const [score,      setScore]      = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [passed,     setPassed]     = useState(false);
  const [resultFile, setResultFile] = useState(null);
  const [missingConfig, setMissingConfig] = useState(false);

  // Guard: if the skill was added before this update (no categoryKey/moduleCode saved)
  useEffect(() => {
    if (isTech && !skill.categoryKey) setMissingConfig(true);
    if (!isTech && !skill.moduleCode)  setMissingConfig(true);
  }, [isTech, skill.categoryKey, skill.moduleCode]);

  const TECH_STEPS     = ['Answer Quiz', 'Result'];
  const ACADEMIC_STEPS = ['Answer Quiz', 'Upload Evidence', 'Result'];
  const stepLabels     = isTech ? TECH_STEPS : ACADEMIC_STEPS;
  const stepNumber     = isTech
    ? ({ quiz:1, result:2 }[step] || 1)
    : ({ quiz:1, upload:2, result:3 }[step] || 1);

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  const handleAnswer = (qi, ai) => setAnswers(prev => ({ ...prev, [qi]: ai }));

  const handleQuizSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    const pct     = Math.round((correct / questions.length) * 100);
    const didPass = isTech ? pct >= 70 : true; // academic always proceeds
    setScore(correct); setPercentage(pct); setPassed(didPass);

    if (isTech) {
      setStep('result');
      onSubmit({
        skillId:       skill._id,
        skillName:     skill.skill,
        skillType:     skill.type,
        type:          'technical',
        categoryKey:   skill.categoryKey,
        categoryLabel,
        passed:        didPass,
        score:         correct,
        totalQuestions: questions.length,
        percentage:    pct,
        method:        'mcq',
        quizAnswers:   questions.map((q, i) => ({
          questionId:     q.id,
          question:       q.question,
          selectedOption: answers[i] ?? -1,
          correctOption:  q.answer,
          isCorrect:      answers[i] === q.answer,
        })),
      });
    } else {
      setStep('upload'); // academic goes to evidence upload first
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File must be under 5 MB'); return; }
    setResultFile({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
  };

  const handleAcademicFinalSubmit = () => {
    setStep('result');
    onSubmit({
      skillId:        skill._id,
      skillName:      skill.skill,
      skillType:      skill.type,
      type:           'academic',
      moduleCode:     skill.moduleCode,
      moduleTitle,
      score,
      totalQuestions: questions.length,
      percentage,
      evidenceFile:   resultFile?.name || null,
      passed:         true,
      method:         'grade',
      submittedAt:    new Date().toISOString(),
      quizAnswers:    questions.map((q, i) => ({
        questionId:     q.id,
        question:       q.question,
        selectedOption: answers[i] ?? -1,
        correctOption:  q.answer,
        isCorrect:      answers[i] === q.answer,
      })),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-base">{isTech ? '🧠 Technical Skill Verification' : '🎓 Academic Module Verification'}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <InfoPill icon="📌" label="Skill"  value={skill.skill}  color="indigo" />
              <InfoPill icon="📊" label="Level"  value={skill.level}  color="violet" />
              {isTech
                ? <InfoPill icon="💻" label="Category" value={categoryLabel} color="indigo" />
                : <InfoPill icon="🎓" label="Module"   value={`${skill.moduleCode} — ${moduleTitle}`} color="emerald" />
              }
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors ml-3 shrink-0">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">

          {/* ── Missing config guard ── */}
          {missingConfig && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 text-center space-y-2">
              <p className="text-sm font-semibold text-amber-800">Verification not available</p>
              <p className="text-xs text-amber-700">
                This skill was added before the verification system was updated.
                Please delete it and re-add it — you will be asked to select a
                {isTech ? ' quiz category' : 'n academic module'} during skill creation.
              </p>
              <button onClick={onClose} className="mt-2 text-xs font-semibold text-amber-700 border border-amber-300 px-4 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">Close</button>
            </div>
          )}

          {!missingConfig && (
            <>
              <StepIndicator steps={stepLabels} current={stepNumber} />

              {/* ── STEP 1: Quiz ── */}
              {step === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Answer all <span className="font-semibold text-slate-700">{questions.length} questions</span>.
                      {isTech && <> Min <span className="font-semibold text-indigo-600">70%</span> to pass.</>}
                    </p>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                      {Object.keys(answers).length}/{questions.length} answered
                    </span>
                  </div>

                  {questions.length === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                      No questions found for this {isTech ? 'category' : 'module'}. Please contact the admin.
                    </div>
                  )}

                  {questions.map((q, qi) => (
                    <div key={q.id} className={`rounded-xl border p-4 transition-colors ${answers[qi] !== undefined ? (isTech ? 'border-indigo-100 bg-indigo-50/40' : 'border-emerald-100 bg-emerald-50/30') : 'border-slate-200 bg-white'}`}>
                      <p className="text-sm font-semibold text-slate-800 mb-3 leading-snug">
                        <span className={`mr-1.5 ${isTech ? 'text-indigo-500' : 'text-emerald-600'}`}>{qi + 1}.</span>{q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, ai) => (
                          <label key={ai} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer border transition-all text-sm ${answers[qi] === ai ? (isTech ? 'border-indigo-400 bg-indigo-50 text-indigo-700 font-medium' : 'border-emerald-400 bg-emerald-50 text-emerald-700 font-medium') : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}>
                            <input type="radio" name={`q${qi}`} className={isTech ? 'accent-indigo-600' : 'accent-emerald-600'} checked={answers[qi] === ai} onChange={() => handleAnswer(qi, ai)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {questions.length > 0 && (
                    <button onClick={handleQuizSubmit} disabled={!allAnswered}
                      className={`w-full text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-40 text-sm ${isTech ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                      {allAnswered
                        ? (isTech ? 'Submit Quiz' : 'Submit Quiz & Continue to Upload →')
                        : `Answer all questions to submit (${questions.length - Object.keys(answers).length} remaining)`}
                    </button>
                  )}
                </div>
              )}

              {/* ── ACADEMIC STEP 2: Upload Evidence ── */}
              {!isTech && step === 'upload' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">Quiz Completed</p>
                      <p className="text-xs text-emerald-600 mt-0.5">You answered {score} of {questions.length} correctly ({percentage}%). Now upload your result sheet as supporting evidence.</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Upload Result Sheet / Grade Evidence</p>
                    <p className="text-xs text-slate-400 mb-3">Upload your official result sheet or grade transcript for <span className="font-semibold text-slate-600">{skill.moduleCode} — {moduleTitle}</span>.</p>
                    <div onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${resultFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'}`}>
                      <div className="text-3xl mb-2">{resultFile ? '✅' : '📄'}</div>
                      <p className="text-sm font-medium text-slate-700">{resultFile ? resultFile.name : 'Click to upload result sheet'}</p>
                      {resultFile ? <p className="text-xs text-emerald-600 mt-1">{resultFile.size} — ready to submit</p> : <p className="text-xs text-slate-400 mt-1">PNG, JPG, or PDF — max 5 MB</p>}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                  </div>
                  {resultFile && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm text-emerald-700">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span className="font-semibold">{resultFile.name}</span> attached
                    </div>
                  )}
                  <button onClick={handleAcademicFinalSubmit} disabled={!resultFile}
                    className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-40 text-sm">
                    Submit for Admin Review
                  </button>
                  <button onClick={handleAcademicFinalSubmit}
                    className="w-full border border-slate-200 text-slate-400 text-xs py-2 rounded-xl hover:bg-slate-50 transition-colors">
                    Skip evidence upload and submit anyway
                  </button>
                </div>
              )}

              {/* ── FINAL STEP: Result ── */}
              {step === 'result' && (
                <div className="text-center py-2 space-y-4">
                  {isTech ? (
                    <div className={`w-24 h-24 rounded-full mx-auto flex flex-col items-center justify-center font-black shadow-inner ${passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      <span className="text-2xl leading-none">{percentage}%</span>
                      <span className="text-xs font-semibold mt-0.5">{score}/{questions.length}</span>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl bg-emerald-50">🎓</div>
                  )}

                  {isTech ? (
                    passed
                      ? <><p className="font-bold text-slate-800 text-lg">Quiz Passed!</p><p className="text-sm text-slate-500 max-w-xs mx-auto">You scored <span className="font-semibold text-emerald-600">{percentage}%</span> on the <span className="font-semibold">{categoryLabel}</span> quiz. Submitted for admin approval.</p></>
                      : <><p className="font-bold text-slate-800 text-lg">Quiz Not Passed</p><p className="text-sm text-slate-500 max-w-xs mx-auto">You scored <span className="font-semibold text-red-500">{percentage}%</span>. You need at least <span className="font-semibold">70%</span>. Review <span className="font-semibold">{categoryLabel}</span> and try again.</p></>
                  ) : (
                    <><p className="font-bold text-slate-800 text-lg">Submission Received!</p><p className="text-sm text-slate-500 max-w-xs mx-auto">Your quiz results and evidence for <span className="font-semibold">{skill.moduleCode} — {moduleTitle}</span> have been submitted. An admin will review and approve your verification.</p></>
                  )}

                  {(isTech ? passed : true)
                    ? <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full">🕐 Pending Admin Review</div>
                    : <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-2 rounded-full">✗ Did not meet the 70% threshold</div>
                  }

                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-left space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Skill</span><span className="font-semibold text-slate-700">{skill.skill}</span></div>
                    {isTech ? (
                      <>
                        <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="font-semibold text-slate-700">{categoryLabel}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Score</span><span className="font-semibold text-slate-700">{score} / {questions.length} correct</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Percentage</span><span className={`font-semibold ${passed ? 'text-emerald-600' : 'text-red-500'}`}>{percentage}%</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={`font-semibold ${passed ? 'text-amber-600' : 'text-red-500'}`}>{passed ? 'Pending Admin Review' : 'Failed'}</span></div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between"><span className="text-slate-500">Module</span><span className="font-semibold text-slate-700">{skill.moduleCode}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Module Title</span><span className="font-semibold text-slate-700 text-right max-w-[60%]">{moduleTitle}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Quiz Score</span><span className="font-semibold text-slate-700">{score} / {questions.length} correct ({percentage}%)</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Evidence</span><span className="font-semibold text-slate-700">{resultFile ? resultFile.name : 'Not uploaded'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-semibold text-amber-600">Pending Admin Review</span></div>
                      </>
                    )}
                  </div>

                  <button onClick={onClose} className="w-full border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">Close</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

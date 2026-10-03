import { AIProvider, ChatMessage, QuizQuestion, Flashcard, StudyTask, WeakTopicAnalysis } from './types';

export const demoProvider: AIProvider = {
  id: 'demo',
  name: 'Demo Engine (Offline-First / Simulated)',
  modelName: 'Built-in Simulated Llama 3.2',

  async chat(messages: ChatMessage[], contextMaterial?: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate realistic network/inference lag
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

    // If context material is provided, let's look for matching keywords
    const notes = contextMaterial ? contextMaterial.toLowerCase() : '';

    // Quick actions or specific user keywords
    if (lastMessage.includes('explain simpler') || lastMessage.includes('simple language') || lastMessage.includes('explain simply')) {
      if (notes.includes('tcp') || lastMessage.includes('tcp') || lastMessage.includes('udp')) {
        return `Let's break down TCP and UDP like we're explaining it to an 8-year-old:

• **TCP** is like sending a registered letter. You write it, send it, and the post office makes sure the recipient signs for it. If any page is lost, they ask you to send it again, and they put all pages in the exact order you wrote them. (Used for Web Browsing & Emails).

• **UDP** is like a postcard. You write a bunch of quick notes and throw them in the mailbox. They travel fast, but if one gets lost, or arrives out of order, you don't stop to fix it. You just keep sending more. (Used for Streaming Video & Live Gaming).

Does that comparison make sense? Let me know if you want another example!`;
      }
      return `Sure! Let's explain this in very simple, conversational terms:

Essentially, this topic is about organizing how information flows. Think of it like a highway system. Instead of throwing everything onto the road at once, we create lanes (protocols) and speed limits (flow control) to ensure nothing crashes.

Would you like a concrete example from your study material?`;
    }

    if (lastMessage.includes('give an example') || lastMessage.includes('for example') || lastMessage.includes('example of')) {
      if (notes.includes('osi') || lastMessage.includes('osi') || lastMessage.includes('layer')) {
        return `Here is a real-world analogy for the **OSI Layers**:

Imagine sending a gift to a friend in another country:
1. **Application Layer**: You decide what gift to send (your message).
2. **Presentation Layer**: You wrap the gift and translate the card to their language.
3. **Session Layer**: You call them to make sure they are home to receive it.
4. **Transport Layer**: You choose a reliable courier (like DHL/TCP) that guarantees delivery.
5. **Network Layer**: The postal service routes the package through different cities (IP addresses).
6. **Data Link Layer**: The package is put inside a specific shipping container with a barcode.
7. **Physical Layer**: The cargo plane physical flies the container across the ocean.

This is exactly how a computer file moves across the internet!`;
      }
      return `Here is a great real-world example:

Imagine you are trying to run a restaurant. If you don't have a structured menu (protocol) and a dedicated waiter (port/session), customers won't know how to order, and the kitchen won't know what to cook. 

In your study materials, this corresponds to establishing clear rules so different systems can understand each other without confusion.`;
    }

    if (lastMessage.includes('test me') || lastMessage.includes('ask a question') || lastMessage.includes('quiz')) {
      return `Great! Let's do a quick knowledge check based on your notes.

Here is a question for you:
**Which OSI layer is responsible for routing data across different networks using IP addresses?**

A) Data Link Layer (Layer 2)
B) Transport Layer (Layer 4)
C) Network Layer (Layer 3)
D) Physical Layer (Layer 1)

Reply with your answer and I'll tell you if you're right!`;
    }

    // Keyword routing based on provided materials
    if (notes.includes('tcp') && (lastMessage.includes('tcp') || lastMessage.includes('udp') || lastMessage.includes('difference'))) {
      return `Based on your uploaded guide, **TCP (Transmission Control Protocol)** and **UDP (User Datagram Protocol)** are the two main Transport Layer protocols, but they work very differently:

1. **Connection Style**: TCP requires a connection (using a 3-way handshake) before sending data. UDP is connectionless and just shoots data immediately.
2. **Reliability**: TCP guarantees that all packets arrive safely and in the correct order. UDP does not guarantee anything — if a packet is lost, it is ignored.
3. **Speed**: TCP has high overhead, making it slower. UDP has low overhead, making it extremely fast.
4. **Use Cases**: TCP is used for HTTP (websites), Email, and FTP. UDP is used for video streaming, DNS, and online gaming.

Let me know if you want me to explain any of these points simpler or provide more analogies!`;
    }

    if (notes.includes('osi') && (lastMessage.includes('osi') || lastMessage.includes('layer') || lastMessage.includes('network'))) {
      return `According to your study guide, the **OSI Model** divides network communication into **7 distinct layers**:

1. **Physical (L1)**: Raw electrical bits.
2. **Data Link (L2)**: Framing and local node-to-node transfer.
3. **Network (L3)**: Routing packets across networks using **IP addresses**.
4. **Transport (L4)**: Safe end-to-end delivery (TCP/UDP).
5. **Session (L5)**: Managing continuous connections.
6. **Presentation (L6)**: Data encryption, compression, and formatting.
7. **Application (L7)**: Human interaction protocols (HTTP, DNS, SSH).

A key takeaway is that each layer relies on the services of the layer directly below it. Which of these layers would you like to review in detail?`;
    }

    if (lastMessage.includes('port') || lastMessage.includes('http') || lastMessage.includes('https') || lastMessage.includes('dns')) {
      return `Looking at your materials, here is a quick summary of the **Common Ports** you need to memorize:

• **Port 80**: HTTP (Unsecured web browsing)
• **Port 443**: HTTPS (Secured web browsing)
• **Port 53**: DNS (Domain Name System resolution)
• **Port 22**: SSH (Secure Shell for remote access)
• **Port 20 & 21**: FTP (File Transfer Protocol)

A great tip for exams: Remember that **HTTPS (443)** is just secure HTTP, and **DNS (53)** runs primarily over UDP because it needs to be blazing fast!`;
    }

    // General response when text matching is low
    if (contextMaterial) {
      // Extract some text snippets to look smart
      const lines = contextMaterial.split('\n').filter(l => l.trim().length > 15).slice(0, 3);
      const highlightedPoints = lines.map(line => `• ${line.replace(/^#+\s*/, '').trim()}`).join('\n');
      
      return `I've analyzed your study guide! Here are the core concepts I've extracted:

${highlightedPoints}

How can I help you study these today? I can explain any difficult terms, quiz you on these specific notes, or provide simple real-world analogies!`;
    }

    return `Hello! I'm your StudyBuddy AI Companion. I'm operating completely in local-privacy mode.

I don't have any specific study guides uploaded yet. Please paste some notes or load the **Computer Networks Demo** using the "Try Demo" button so I can tutor you step-by-step with zero information leaving your device!`;
  },

  async summarize(material: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const lines = material.split('\n').filter(l => l.trim().length > 10);
    const summaryPoints = lines.slice(0, Math.min(lines.length, 5)).map(l => `• ${l.replace(/^#+\s*/, '').trim()}`);
    return `### Study Material Summary\n\nThis material is focused on core components of networking. Here are the key highlights:\n\n${summaryPoints.join('\n')}\n\n**Key Takeaway**: Understanding the layers of communication is vital to diagnosing connectivity problems and designing resilient software architectures.`;
  },

  async generateQuiz(material: string, topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number): Promise<QuizQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const lowerTopic = topic.toLowerCase();
    
    // Default mock database of high-fidelity questions
    const networkQuestions: QuizQuestion[] = [
      {
        question: "Which OSI layer is responsible for translating, encrypting, and compressing data?",
        options: [
          "Session Layer (Layer 5)",
          "Presentation Layer (Layer 6)",
          "Application Layer (Layer 7)",
          "Transport Layer (Layer 4)"
        ],
        correctAnswerIndex: 1,
        explanation: "The Presentation Layer (Layer 6) ensures that data is in a usable format and is where data encryption, compression, and translation occur."
      },
      {
        question: "What is the primary difference between TCP and UDP connection styles?",
        options: [
          "TCP is connectionless; UDP requires a 3-way handshake.",
          "TCP requires a 3-way handshake (connection-oriented); UDP is connectionless.",
          "TCP uses IP addresses; UDP uses MAC addresses.",
          "TCP only runs on local networks; UDP is for wide-area networks."
        ],
        correctAnswerIndex: 1,
        explanation: "TCP is connection-oriented and establishes a session using a 3-way handshake prior to transmitting data. UDP is connectionless and sends datagrams without a handshake."
      },
      {
        question: "Which of the following ports is correctly mapped to its secure protocol?",
        options: [
          "Port 80: HTTPS",
          "Port 22: HTTP",
          "Port 443: HTTPS",
          "Port 53: SSH"
        ],
        correctAnswerIndex: 2,
        explanation: "HTTPS (HTTP Secure) runs on Port 443. Port 80 is for unencrypted HTTP, Port 22 is for SSH, and Port 53 is for DNS."
      },
      {
        question: "At which layer of the OSI model does routing (determining the path across multiple networks) take place?",
        options: [
          "Data Link Layer",
          "Physical Layer",
          "Transport Layer",
          "Network Layer"
        ],
        correctAnswerIndex: 3,
        explanation: "The Network Layer (Layer 3) is responsible for routing packets across networks using logical addressing (IP addresses)."
      },
      {
        question: "Which protocol is preferred for real-time video streaming or gaming, and why?",
        options: [
          "TCP, because it ensures that no frames of video are lost.",
          "UDP, because speed and low overhead are prioritized over individual packet recovery.",
          "FTP, because files must be buffered.",
          "HTTP, because websites need to render it."
        ],
        correctAnswerIndex: 1,
        explanation: "UDP is preferred for real-time applications because its lack of connection overhead and retransmission delays prevents stuttering, making speed superior to perfect reliability."
      }
    ];

    const generalQuestions: QuizQuestion[] = [
      {
        question: "Which study strategy is most effective for long-term retention of difficult concepts?",
        options: [
          "Re-reading the textbook multiple times passively",
          "Active recall combined with spaced repetition (like flashcards & quizzes)",
          "Highlighting every line of the notes in fluorescent yellow",
          "Cramming the entire subject 2 hours before the exam"
        ],
        correctAnswerIndex: 1,
        explanation: "Active recall (testing yourself) and spaced repetition are scientifically proven to build stronger neural pathways and dramatically increase long-term memory retrieval."
      },
      {
        question: "What does it mean to explain a concept in 'simple language'?",
        options: [
          "Using complex industry jargon to sound intelligent",
          "Avoiding all details and leaving the page empty",
          "Using relatable real-world analogies and clear, everyday words",
          "Translating the notes into code comments"
        ],
        correctAnswerIndex: 2,
        explanation: "Simplifying explanations involves mapping abstract concepts to tangible, real-world examples that don't rely on specialized prior knowledge."
      }
    ];

    // Filter or select questions based on content
    const baseList = (material.toLowerCase().includes('tcp') || lowerTopic.includes('network') || lowerTopic.includes('tcp')) 
      ? networkQuestions 
      : generalQuestions;

    // Slice and return requested count
    const selected = [...baseList];
    while (selected.length < count) {
      // Duplicate with slight variations if they request more than we have
      selected.push({
        question: `[Practice] Reviewing: ${topic || 'Key Concepts'} - Can you identify the core mechanism of this system?`,
        options: [
          "It is a centralized database system",
          "It is a modular protocol with specific layer boundaries",
          "It operates purely offline on local hardware",
          "All of the above"
        ],
        correctAnswerIndex: 3,
        explanation: "In modular educational systems, having clearly defined boundaries between components makes them easy to replace and optimize."
      });
    }

    return selected.slice(0, count);
  },

  async generateFlashcards(material: string, count: number): Promise<Flashcard[]> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isNetwork = material.toLowerCase().includes('tcp') || material.toLowerCase().includes('osi');

    const networkCards: Flashcard[] = [
      {
        id: 'fc_1',
        question: "What are the 7 Layers of the OSI Model from bottom to top?",
        answer: "1. Physical, 2. Data Link, 3. Network, 4. Transport, 5. Session, 6. Presentation, 7. Application. (A popular mnemonic: Please Do Not Throw Sausage Pizza Away).",
        topic: "OSI Model"
      },
      {
        id: 'fc_2',
        question: "Does DNS run over TCP or UDP by default?",
        answer: "DNS runs over UDP (Port 53) because DNS queries need to be completed as quickly as possible, and the low overhead of UDP is perfect for simple name requests.",
        topic: "Ports"
      },
      {
        id: 'fc_3',
        question: "What is the 3-Way Handshake in TCP?",
        answer: "It is the process used to establish a connection: 1. SYN (Synchronize), 2. SYN-ACK (Synchronize-Acknowledge), 3. ACK (Acknowledge). This ensures both computers are ready to talk.",
        topic: "TCP/UDP"
      },
      {
        id: 'fc_4',
        question: "What is the primary device or address used at Layer 3 (Network Layer)?",
        answer: "Layer 3 uses IP Addresses and Routers to direct traffic across different interconnected networks.",
        topic: "OSI Model"
      },
      {
        id: 'fc_5',
        question: "What is Port 443 used for?",
        answer: "Port 443 is used for HTTPS, which is secure web traffic encrypted with TLS/SSL.",
        topic: "Ports"
      }
    ];

    const generalCards: Flashcard[] = [
      {
        id: 'fc_gen1',
        question: "What is 'Active Recall'?",
        answer: "An active learning strategy where you force your brain to retrieve information from memory without looking at notes, which strengthens memory connections.",
        topic: "Study Tips"
      },
      {
        id: 'fc_gen2',
        question: "What is 'Spaced Repetition'?",
        answer: "Reviewing material at increasing intervals (e.g., 1 day, 3 days, 1 week) to combat the forgetting curve and lock information into long-term memory.",
        topic: "Study Tips"
      }
    ];

    const baseCards = isNetwork ? networkCards : generalCards;
    const cards = [...baseCards];
    while (cards.length < count) {
      const idx = cards.length;
      cards.push({
        id: `fc_extra_${idx}`,
        question: `Key concept check #${idx + 1}: Summarize the main objective of this study block.`,
        answer: "The main goal is to break down complex processes into simple, distinct modules so they can be understood and recalled effortlessly.",
        topic: "Review"
      });
    }

    return cards.slice(0, count);
  },

  async generateStudyPlan(goal: string, hoursPerDay: number, examDate: string, subjects: string[]): Promise<StudyTask[]> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Create a 5-day structured plan based on subjects
    const plan: StudyTask[] = [];
    const actualSubjects = subjects.length > 0 ? subjects : ['Core Concepts', 'Practical Application'];

    const tasksPerDay = [
      { title: 'Core Foundations & Vocab', minutes: 60 },
      { title: 'Deep Dive: Key Mechanics & Analogy Mapping', minutes: 90 },
      { title: 'Active Recall & First Practice Quiz', minutes: 45 },
      { title: 'Review Weak Topics & Flashcard Mastery', minutes: 60 },
      { title: 'Comprehensive Mock Exam & Final Polish', minutes: 90 }
    ];

    actualSubjects.forEach((subject, subIndex) => {
      tasksPerDay.forEach((taskConfig, dayIndex) => {
        const dayNum = dayIndex + 1 + (subIndex * 2); // Spread subjects
        if (dayNum <= 5) {
          plan.push({
            id: `task_${subIndex}_${dayIndex}`,
            day: `Day ${dayNum}`,
            title: `[${subject}] ${taskConfig.title}`,
            topic: subject,
            durationMinutes: Math.min(taskConfig.minutes, hoursPerDay * 60),
            isCompleted: false
          });
        }
      });
    });

    // Sort by day numerical value
    return plan.sort((a, b) => {
      const dayA = parseInt(a.day.replace('Day ', '')) || 0;
      const dayB = parseInt(b.day.replace('Day ', '')) || 0;
      return dayA - dayB;
    });
  },

  async analyzeWeakTopics(
    quizScores: { topic: string; score: number; total: number }[],
    flashcardPerformance: { cardId: string; correct: boolean; topic: string }[]
  ): Promise<WeakTopicAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simple analysis
    const strong: string[] = [];
    const weak: string[] = [];

    // Analyze quiz
    quizScores.forEach(q => {
      const pct = (q.score / q.total) * 100;
      if (pct >= 75) {
        if (!strong.includes(q.topic)) strong.push(q.topic);
      } else {
        if (!weak.includes(q.topic)) weak.push(q.topic);
      }
    });

    // Analyze flashcards
    const cardMap: Record<string, { correct: number; total: number }> = {};
    flashcardPerformance.forEach(f => {
      if (!cardMap[f.topic]) {
        cardMap[f.topic] = { correct: 0, total: 0 };
      }
      cardMap[f.topic].total += 1;
      if (f.correct) cardMap[f.topic].correct += 1;
    });

    Object.entries(cardMap).forEach(([topic, stats]) => {
      const pct = (stats.correct / stats.total) * 100;
      if (pct >= 75) {
        if (!strong.includes(topic)) strong.push(topic);
      } else {
        if (!weak.includes(topic)) {
          weak.push(topic);
          // Remove from strong if it's struggling in flashcards
          const idx = strong.indexOf(topic);
          if (idx !== -1) strong.splice(idx, 1);
        }
      }
    });

    // Default if lists are empty
    if (strong.length === 0 && weak.length === 0) {
      return {
        strongTopics: ["Common Network Ports"],
        weakTopics: ["TCP vs UDP Handshakes", "OSI Layer 6 Formatting"],
        recommendations: [
          "Review the differences between connection-oriented and connectionless protocols.",
          "Spend 10 minutes testing yourself on the 7-layer OSI pizza mnemonic."
        ],
        suggestedPracticeQuestions: [
          { question: "Can you detail the exact response code of HTTP 3-way handshake in normal state?", topic: "TCP vs UDP Handshakes" },
          { question: "Why is encryption placed at Layer 6 instead of the application Layer?", topic: "OSI Layer 6 Formatting" }
        ]
      };
    }

    const recommendations = weak.map(w => `Spend 15 minutes reviewing the core vocabulary and analogical examples for '${w}'. Then, generate a short 3-question quiz to test your memory.`);
    if (recommendations.length === 0) {
      recommendations.push("Your understanding is exceptionally balanced! Try increasing the quiz difficulty to 'Hard' to challenge yourself further.");
    }

    const suggestedPracticeQuestions = weak.map(w => ({
      question: `What is the single most common failure point when configuring systems running under '${w}'?`,
      topic: w
    }));

    return {
      strongTopics: strong,
      weakTopics: weak.length > 0 ? weak : ["Advanced Protocol Variations"],
      recommendations,
      suggestedPracticeQuestions: suggestedPracticeQuestions.length > 0 ? suggestedPracticeQuestions : [
        { question: "What is the role of congestion windows in high-speed transfers?", topic: "Advanced Protocol Variations" }
      ]
    };
  }
};

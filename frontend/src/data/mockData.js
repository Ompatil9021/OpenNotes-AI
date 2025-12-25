export const subjects = [
  {
    id: "sub-001",
    title: "Computer Science",
    icon: "💻",
    description: "Programming, Algorithms, and Systems.",
    chapters: [
      {
        id: "ch-101",
        title: "Artificial Intelligence",
        topics: [
          { id: "top-1", title: "Intro to AI", type: "pdf", fileUrl: "sample.pdf" },
          { id: "top-2", title: "Neural Networks", type: "video", fileUrl: "video.mp4" },
          { id: "top-3", title: "Expert Systems", type: "pdf", fileUrl: "expert.pdf" }
        ]
      },
      {
        id: "ch-102",
        title: "Web Development",
        topics: [
          { id: "top-4", title: "React Basics", type: "pdf", fileUrl: "react.pdf" },
          { id: "top-5", title: "Node.js Backend", type: "ppt", fileUrl: "node.ppt" }
        ]
      }
    ]
  },
  {
    id: "sub-002",
    title: "Mathematics",
    icon: "📐",
    description: "Calculus, Algebra, and Statistics.",
    chapters: [
      {
        id: "ch-201",
        title: "Calculus I",
        topics: [
          { id: "top-6", title: "Limits & Continuity", type: "pdf", fileUrl: "calc.pdf" }
        ]
      }
    ]
  },
  {
    id: "sub-003",
    title: "Drone Technology",
    icon: "🚁",
    description: "Aerodynamics, Control Systems, and Sensors.",
    chapters: []
  }
];
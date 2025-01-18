const Hero = () => (<section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-purple-soft to-white">
    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-purple-dark">
      Welcome to My Portfolio
    </h1>
    <p className="text-xl md:text-2xl text-purple-tertiary max-w-2xl mb-8">
      I'm a developer passionate about creating beautiful and functional web applications
    </p>
    <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-primary text-white rounded-lg hover:bg-purple-vivid transition-colors">
      <Github className="w-5 h-5"/>
      View GitHub Profile
    </a>
  </section>);
export default Hero;

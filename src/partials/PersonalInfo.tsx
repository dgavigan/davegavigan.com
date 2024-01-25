const PersonalInfo = () => (
  <div className="mb-4 w-full rounded-lg bg-white p-6 shadow-md">
    <h2 className="mb-4 text-2xl font-bold">Information</h2>

    <div className="flex justify-between border-b border-gray-200 py-2">
      <span className="font-semibold">Location</span>
      <span>Austin, TX</span>
    </div>

    <div className="flex justify-between border-b border-gray-200 py-2">
      <span className="font-semibold">Experience</span>
      <span>10+ years</span>
    </div>

    <div className="flex justify-between border-b border-gray-200 py-2">
      <span className="font-semibold">Email</span>
      <span>davegavigan@gmail.com</span>
    </div>

    <div className="flex justify-between border-b border-gray-200 py-2">
      <span className="font-semibold">Work Status</span>
      <span>Open to work</span>
    </div>

    <a
      href="/assets/GaviganDavid_Resume.pdf"
      download
      className="mt-5 flex items-center rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
    >
      <i className="fas fa-download mr-2"></i>
      Download Resume
    </a>
  </div>
);

export { PersonalInfo };

require "webrick"

root = File.expand_path(__dir__)
port = Integer(ENV.fetch("PORT", "8000"))

server = WEBrick::HTTPServer.new(
  Port: port,
  DocumentRoot: root,
  AccessLog: [],
  Logger: WEBrick::Log.new($stderr, WEBrick::Log::WARN),
)

trap("INT") { server.shutdown }
trap("TERM") { server.shutdown }

server.start

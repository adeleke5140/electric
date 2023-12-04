defmodule Electric.Postgres.Proxy.WebsocketServer do
  @behaviour WebSock

  @impl WebSock
  def init(opts) do
    proxy_config = Keyword.fetch!(opts, :proxy_config)
    proxy_port = Keyword.fetch!(proxy_config.listen, :port)
    {:ok, connect(%{proxy_port: proxy_port})}
  end

  @impl WebSock
  def handle_in({data, opcode: :binary}, state) do
    case :gen_tcp.send(state.tcp_socket, data) do
      :ok -> {:ok, state}
      {:error, reason} -> {:stop, reason, state}
    end
  end

  @impl WebSock
  def handle_info({:tcp, _socket, data}, state) do
    {:push, [{:binary, data}], state}
  end

  def handle_info({:tcp_closed, _socket}, state) do
    {:stop, :normal, state}
  end

  defp connect(state) do
    {:ok, socket} = :gen_tcp.connect(~c"localhost", state.proxy_port, keepalive: true)
    Map.put(state, :tcp_socket, socket)
  end
end

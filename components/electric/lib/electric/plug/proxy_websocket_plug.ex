defmodule Electric.Plug.ProxyWebsocketPlug do
  @behaviour Plug

  import Plug.Conn

  alias Electric.Replication.Connectors

  require Logger

  def init(handler_opts), do: handler_opts

  defp build_websocket_opts(base_opts),
    do:
      Keyword.put_new_lazy(base_opts, :proxy_config, fn ->
        Electric.Application.pg_connection_opts() |> Connectors.get_proxy_opts()
      end)

  def call(conn, handler_opts) do
    with {:ok, conn} <- check_if_valid_upgrade(conn) do
      conn
      |> upgrade_adapter(
        :websocket,
        {Electric.Postgres.Proxy.WebsocketServer, build_websocket_opts(handler_opts), []}
      )
    else
      {:error, code, body} ->
        Logger.debug("Clients WebSocket connection failed with reason: #{body}")
        send_resp(conn, code, body)
    end
  end

  defp check_if_valid_upgrade(%Plug.Conn{} = conn) do
    if Bandit.WebSocket.Handshake.valid_upgrade?(conn) do
      {:ok, conn}
    else
      {:error, 400, "Bad request"}
    end
  end
end

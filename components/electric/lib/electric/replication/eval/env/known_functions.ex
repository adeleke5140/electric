defmodule Electric.Replication.Eval.Env.KnownFunctions do
  use Electric.Replication.Eval.KnownDefinition

  alias Electric.Replication.PostgresInterop.Casting

  ## "input" functions

  defpostgres "int2(text) -> int2", delegate: &Casting.parse_int2/1
  defpostgres "int4(text) -> int4", delegate: &Casting.parse_int4/1
  defpostgres "int8(text) -> int8", delegate: &Casting.parse_int8/1
  defpostgres "float4(text) -> float4", delegate: &Casting.parse_float8/1
  defpostgres "float8(text) -> float8", delegate: &Casting.parse_float8/1
  defpostgres "numeric(text) -> numeric", delegate: &Casting.parse_float8/1
  defpostgres "bool(text) -> bool", delegate: &Casting.parse_bool/1

  ## Numeric functions

  defpostgres "+ *numeric_type* -> *numeric_type*", delegate: &Kernel.+/1
  defpostgres "- *numeric_type* -> *numeric_type*", delegate: &Kernel.-/1
  defpostgres "*numeric_type* + *numeric_type* -> *numeric_type*", delegate: &Kernel.+/2
  defpostgres "*numeric_type* - *numeric_type* -> *numeric_type*", delegate: &Kernel.-/2
  defpostgres "*numeric_type* > *numeric_type* -> bool", delegate: &Kernel.>/2
  defpostgres "*numeric_type* >= *numeric_type* -> bool", delegate: &Kernel.>=/2
  defpostgres "*numeric_type* < *numeric_type* -> bool", delegate: &Kernel.</2
  defpostgres "*numeric_type* <= *numeric_type* -> bool", delegate: &Kernel.<=/2
  defpostgres "*integral_type* / *integral_type* -> bool", delegate: &Kernel.div/2
  defpostgres "float8 / float8 -> bool", delegate: &Kernel.//2
  defpostgres "numeric ^ numeric -> numeric", delegate: &Float.pow/2
  defpostgres "float8 ^ float8 -> float8", delegate: &Float.pow/2
  defpostgres "|/ float8 -> float8", delegate: &:math.sqrt/1
  defpostgres "@ *numeric_type* -> *numeric_type*", delegate: &:erlang.abs/1
  defpostgres "*integral_type* & *integral_type* -> *integral_type*", delegate: &Bitwise.band/2
  defpostgres "*integral_type* | *integral_type* -> *integral_type*", delegate: &Bitwise.bor/2
  defpostgres "*integral_type* # *integral_type* -> *integral_type*", delegate: &Bitwise.bxor/2

  ## String functions

  defpostgres "text || text -> text" do
    # Can't do `delegate: &Kernel.<>/2`, because it's a macro that gets converted to local function call
    def text_concat(t1, t2) when is_binary(t1) and is_binary(t2) do
      <<t1::binary, t2::binary>>
    end
  end

  defpostgres "lower(text) -> text", delegate: &String.downcase/1
  defpostgres "upper(text) -> text", delegate: &String.upcase/1
  defpostgres "text ~~ text -> bool", delegate: &Casting.like?/2
  defpostgres "text ~~* text -> bool", delegate: &Casting.ilike?/2

  defpostgres "text !~~ text -> bool" do
    def not_like?(text1, text2), do: not Casting.like?(text1, text2)
  end

  defpostgres "text !~~* text -> bool" do
    def not_ilike?(text1, text2), do: not Casting.ilike?(text1, text2)
  end
end

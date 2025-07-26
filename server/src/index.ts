import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";

type Bindings = {
	ZEROEX_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(cors());

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
});

app.get("/api/swap/price", async (c) => {
	try {
		const { sellToken, buyToken, sellAmount, chainId = "1" } = c.req.query();

		if (!sellToken || !buyToken || !sellAmount) {
			return c.json({ error: "Missing required parameters" }, 400);
		}

		const params = new URLSearchParams({
			chainId,
			sellToken,
			buyToken,
			sellAmount,
		});

		const response = await fetch(
			`https://api.0x.org/swap/permit2/price?${params}`,
			{
				headers: {
					"0x-api-key": c.env.ZEROEX_API_KEY || "",
					"0x-version": "v2",
				},
			},
		);

		if (!response.ok) {
			throw new Error(`0x API error: ${response.status}`);
		}

		const data = (await response.json()) as Record<string, any>;
		return c.json(data);
	} catch (error) {
		console.error("Price API error:", error);
		return c.json({ error: "Failed to fetch price" }, 500);
	}
});

app.get("/api/swap/quote", async (c) => {
	try {
		const {
			sellToken,
			buyToken,
			sellAmount,
			chainId = "1",
			taker,
		} = c.req.query();

		if (!sellToken || !buyToken || !sellAmount || !taker) {
			return c.json({ error: "Missing required parameters" }, 400);
		}

		const params = new URLSearchParams({
			chainId,
			sellToken,
			buyToken,
			sellAmount,
			taker,
		});

		const response = await fetch(
			`https://api.0x.org/swap/permit2/quote?${params}`,
			{
				headers: {
					"0x-api-key": c.env.ZEROEX_API_KEY || "",
					"0x-version": "v2",
				},
			},
		);

		if (!response.ok) {
			throw new Error(`0x API error: ${response.status}`);
		}

		const data = (await response.json()) as Record<string, any>;
		return c.json(data, { status: 200 });
	} catch (error) {
		console.error("Quote API error:", error);
		return c.json({ error: "Failed to fetch quote" }, 500);
	}
});

export default app;

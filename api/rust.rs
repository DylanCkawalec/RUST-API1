use serde_json::json;
use std::time::{Instant, SystemTime};
use vercel_runtime::{Body, Error, Request, Response};
use std::net::SocketAddr;
use hyper::{Body as HyperBody, Request as HyperRequest, Response as HyperResponse, Server};
use hyper::StatusCode as HyperStatusCode;
use vercel_runtime::StatusCode as VercelStatusCode;
use hyper::header;
use rand::SeedableRng;
use rand::Rng;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3001".to_string())
        .parse::<u16>()
        .unwrap();
    
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    
    let make_service = hyper::service::make_service_fn(|_conn| async {
        Ok::<_, Error>(hyper::service::service_fn(service_handler))
    });

    let server = Server::bind(&addr).serve(make_service);
    println!("Rust server running on port {}", port);
    
    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
    
    Ok(())
}

pub async fn handler(_req: Request) -> Result<Response<Body>, Error> {
    let start = Instant::now();

    let seed = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let mut rng = oorandom::Rand32::new(seed);

    const RADIUS: u64 = 424242;
    const LOOPS: u64 = 1_000_000;

    let mut counter = 0;

    for _ in 0..LOOPS {
        let x: u64 = rng.rand_range(1..RADIUS as u32).into();
        let y: u64 = rng.rand_range(1..RADIUS as u32).into();

        if (x.pow(2) + y.pow(2)) < (RADIUS.pow(2)) {
            counter += 1;
        }
    }

    let pi = (4.0 * counter as f64) / LOOPS as f64;

    let duration = start.elapsed();

    Ok(Response::builder()
        .status(VercelStatusCode::OK)
        .header("Content-Type", "application/json")
        .body(
            json!({
                "runtime": "rust",
                "message": format!("{} / {}", counter, LOOPS),
                "time": format!("{:.2?}", duration),
                "pi": pi
            })
            .to_string()
            .into(),
        )?)
}

async fn hyper_handler(_req: HyperRequest<HyperBody>) -> Result<HyperResponse<HyperBody>, Error> {
    let start = Instant::now();

    let seed = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let mut rng = oorandom::Rand32::new(seed);

    const RADIUS: u64 = 424242;
    const LOOPS: u64 = 1_000_000;

    let mut counter = 0;

    for _ in 0..LOOPS {
        let x: u64 = rng.rand_range(1..RADIUS as u32).into();
        let y: u64 = rng.rand_range(1..RADIUS as u32).into();

        if (x.pow(2) + y.pow(2)) < (RADIUS.pow(2)) {
            counter += 1;
        }
    }

    let pi = (4.0 * counter as f64) / LOOPS as f64;
    let duration = start.elapsed();

    Ok(HyperResponse::builder()
        .status(HyperStatusCode::OK)
        .header("Content-Type", "application/json")
        .header("Access-Control-Allow-Origin", "http://localhost:3000")
        .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        .header("Access-Control-Allow-Headers", "Content-Type")
        .body(
            HyperBody::from(
                json!({
                    "runtime": "rust",
                    "message": format!("{} / {}", counter, LOOPS),
                    "time": format!("{:.2?}", duration),
                    "pi": pi
                })
                .to_string()
            )
        )?)
}

async fn options_handler() -> Result<HyperResponse<HyperBody>, Error> {
    Ok(HyperResponse::builder()
        .status(HyperStatusCode::OK)
        .header("Access-Control-Allow-Origin", "http://localhost:3000")
        .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        .header("Access-Control-Allow-Headers", "Content-Type")
        .body(HyperBody::empty())?)
}

async fn service_handler(req: HyperRequest<HyperBody>) -> Result<HyperResponse<HyperBody>, Error> {
    if req.uri().path() == "/calculate" && req.method() == hyper::Method::POST {
        let start = Instant::now();
        
        let seed = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs();
            
        // Your Monte Carlo calculation here
        let radius = 424242;
        let loops = 1_000_000;
        let mut counter = 0;
        
        let mut rng = rand::rngs::StdRng::seed_from_u64(seed);
        
        for _ in 0..loops {
            let x: f64 = rng.gen_range(0.0..radius as f64);
            let y: f64 = rng.gen_range(0.0..radius as f64);
            
            if x*x + y*y < (radius as f64).powi(2) {
                counter += 1;
            }
        }
        
        let pi = (4.0 * counter as f64) / loops as f64;
        let duration = start.elapsed().as_millis();

        let response = json!({
            "runtime": "rust",
            "message": format!("{} / {}", counter, loops),
            "time": format!("{} milliseconds", duration),
            "pi": pi
        });

        let mut resp = HyperResponse::new(HyperBody::from(response.to_string()));
        resp.headers_mut().insert(
            header::CONTENT_TYPE,
            "application/json".parse().unwrap()
        );
        Ok(resp)
    } else {
        let mut resp = HyperResponse::default();
        *resp.status_mut() = HyperStatusCode::NOT_FOUND;
        Ok(resp)
    }
}

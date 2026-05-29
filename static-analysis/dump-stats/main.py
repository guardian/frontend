import csv
import os
from datetime import datetime, timezone

import boto3

START_DATE = datetime(2026, 2, 1, tzinfo=timezone.utc)
END_DATE = datetime(2026, 5, 1, tzinfo=timezone.utc)

DATA_FOLDER = "./data/"


def main():
    os.makedirs(DATA_FOLDER, exist_ok=True)

    session = boto3.Session(profile_name="frontend")
    cloudwatch = session.client("cloudwatch", region_name="eu-west-1")

    # List all metrics under the namespace
    paginator = cloudwatch.get_paginator("list_metrics")
    metrics = []
    for page in paginator.paginate(Namespace="ALB/PlayRequestCount", MetricName="RequestCount"):
        metrics.extend(page["Metrics"])

    # Use the first metric to determine dimension names (all metrics share the same dimensions)
    dimension_names = [d["Name"] for d in metrics[0].get("Dimensions", [])]
    fieldnames = ["timestamp"] + dimension_names + ["value"]

    rows = []

    for metric in metrics:
        response = cloudwatch.get_metric_data(
            MetricDataQueries=[
                {
                    "Id": "m1",
                    "MetricStat": {
                        "Metric": metric,
                        "Period": 86400,
                        "Stat": "Maximum",
                    },
                }
            ],
            StartTime=START_DATE,
            EndTime=END_DATE,
        )

        dimensions = {d["Name"]: d["Value"] for d in metric.get("Dimensions", [])}
        result = response.get("MetricDataResults", [{}])[0]
        for timestamp, value in zip(result.get("Timestamps", []), result.get("Values", [])):
            rows.append({"timestamp": timestamp.isoformat(), **dimensions, "value": value})

    with open(os.path.join(DATA_FOLDER, "metric_data.csv"), "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Done. Wrote {len(rows)} rows for {len(metrics)} metrics.")


if __name__ == "__main__":
    main()
